import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda/trigger/api-gateway-proxy";
import { Roles } from "src/enums/roles";
import photosService from "src/services/photoServices/photosService";
import responseCreator from "src/services/utils/responseCreator";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.requestContext.authorizer) {
      return responseCreator.error(400);
    }
    const { personId, role } = event.requestContext.authorizer;
    if (role !== Roles.USER) {
      return responseCreator.forbiddenForRole(role);
    }
    const photos = await photosService.getAllUserPhotos(personId);
    return responseCreator.default(JSON.stringify(photos), 200);
  } catch (err) {
    return responseCreator.error(err);
  }
};
