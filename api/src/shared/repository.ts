import {
  BatchWriteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { TABLE_NAME } from "./config";
import { ddb } from "./dynamodb";
import { isConditionalCheckFailed } from "./errors";
import { linkPk, metadataSk, statsSk } from "./keys";
import type { DailyStatsItem, LinkItem } from "./models";

function linkMetadataKey(shortCode: string): { PK: string; SK: string } {
  return {
    PK: linkPk(shortCode),
    SK: metadataSk
  };
}

export async function getLink(shortCode: string): Promise<LinkItem | null> {
  const result = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: linkMetadataKey(shortCode)
    })
  );

  return (result.Item as LinkItem | undefined) ?? null;
}

export async function tryCreateLink(link: LinkItem): Promise<boolean> {
  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: link,
        ConditionExpression: "attribute_not_exists(PK) AND attribute_not_exists(SK)"
      })
    );
    return true;
  } catch (error) {
    if (isConditionalCheckFailed(error)) {
      return false;
    }
    throw error;
  }
}

type LinkPatch = {
  expiresAt?: number | null;
  passwordHash?: string;
  removePassword?: boolean;
};

export async function patchLink(
  shortCode: string,
  patch: LinkPatch
): Promise<LinkItem | null> {
  const setExpressions: string[] = [];
  const removeExpressions: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};

  if (patch.expiresAt !== undefined) {
    names["#expiresAt"] = "expiresAt";
    if (patch.expiresAt === null) {
      removeExpressions.push("#expiresAt");
    } else {
      setExpressions.push("#expiresAt = :expiresAt");
      values[":expiresAt"] = patch.expiresAt;
    }
  }

  if (patch.passwordHash !== undefined) {
    names["#passwordHash"] = "passwordHash";
    setExpressions.push("#passwordHash = :passwordHash");
    values[":passwordHash"] = patch.passwordHash;
  }

  if (patch.removePassword) {
    names["#passwordHash"] = "passwordHash";
    removeExpressions.push("#passwordHash");
  }

  if (setExpressions.length === 0 && removeExpressions.length === 0) {
    return null;
  }

  const updateExpressionParts: string[] = [];
  if (setExpressions.length > 0) {
    updateExpressionParts.push(`SET ${setExpressions.join(", ")}`);
  }
  if (removeExpressions.length > 0) {
    updateExpressionParts.push(`REMOVE ${removeExpressions.join(", ")}`);
  }

  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: linkMetadataKey(shortCode),
        UpdateExpression: updateExpressionParts.join(" "),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues:
          Object.keys(values).length > 0 ? values : undefined,
        ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
        ReturnValues: "ALL_NEW"
      })
    );

    return (result.Attributes as LinkItem | undefined) ?? null;
  } catch (error) {
    if (isConditionalCheckFailed(error)) {
      return null;
    }
    throw error;
  }
}

export async function incrementAnalytics(
  shortCode: string,
  accessedAt: string
): Promise<void> {
  const date = accessedAt.slice(0, 10);

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: linkMetadataKey(shortCode),
      UpdateExpression: "ADD clickCount :inc SET lastAccessedAt = :lastAccessedAt",
      ExpressionAttributeValues: {
        ":inc": 1,
        ":lastAccessedAt": accessedAt
      },
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)"
    })
  );

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: linkPk(shortCode),
        SK: statsSk(date)
      },
      UpdateExpression: "ADD #count :inc SET #date = :date, entityType = :entityType",
      ExpressionAttributeNames: {
        "#count": "count",
        "#date": "date"
      },
      ExpressionAttributeValues: {
        ":inc": 1,
        ":date": date,
        ":entityType": "DAILY_STATS"
      }
    })
  );
}

export async function getDailyStats(shortCode: string): Promise<DailyStatsItem[]> {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :statsPrefix)",
      ExpressionAttributeValues: {
        ":pk": linkPk(shortCode),
        ":statsPrefix": "STATS#"
      }
    })
  );

  return (result.Items as DailyStatsItem[] | undefined) ?? [];
}

async function batchDeleteKeys(keys: Array<{ PK: string; SK: string }>): Promise<void> {
  if (keys.length === 0) {
    return;
  }

  for (let index = 0; index < keys.length; index += 25) {
    const chunk = keys.slice(index, index + 25);
    let pending = chunk.map((key) => ({
      DeleteRequest: { Key: key }
    }));

    while (pending.length > 0) {
      const result = await ddb.send(
        new BatchWriteCommand({
          RequestItems: {
            [TABLE_NAME]: pending
          }
        })
      );

      pending =
        (result.UnprocessedItems?.[TABLE_NAME] as
          | Array<{ DeleteRequest: { Key: { PK: string; SK: string } } }>
          | undefined) ?? [];
    }
  }
}

export async function deleteLinkWithStats(shortCode: string): Promise<boolean> {
  const keys: Array<{ PK: string; SK: string }> = [];
  let lastEvaluatedKey: Record<string, any> | undefined;

  do {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
          ":pk": linkPk(shortCode)
        },
        ProjectionExpression: "PK, SK",
        ExclusiveStartKey: lastEvaluatedKey
      })
    );

    const pageKeys =
      (result.Items as Array<{ PK: string; SK: string }> | undefined) ?? [];
    keys.push(...pageKeys);
    lastEvaluatedKey = result.LastEvaluatedKey as Record<string, any> | undefined;
  } while (lastEvaluatedKey);

  if (keys.length === 0) {
    return false;
  }

  await batchDeleteKeys(keys);
  return true;
}
