import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda/trigger/api-gateway-proxy";
import { Roles } from "src/enums/roles";
import authService from "src/services/authService";
import { ApiError } from "src/errors/apiError";
import photosUploader from "src/services/photosUploader";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.headers.Authorization) {
      return {
        statusCode: 400,
        body: JSON.stringify(`Authorization header is missing.`),
      };
    }
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify(`JSON body is missing.`),
      };
    }
    const { Authorization: authToken } = event.headers;
    const { albumId, photos } = JSON.parse(event.body);
    await authService.checkAuth(authToken, Roles.PHOTOGRAPHER);
    await photosUploader.uploadMany(photos, albumId);
    return { statusCode: 200, body: JSON.stringify("Photos uploaded") };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        statusCode: err.code,
        body: JSON.stringify(`${err}`),
      };
    }
    return {
      statusCode: 400,
      body: JSON.stringify(`Bad request: ${err}`),
    };
  }
};
