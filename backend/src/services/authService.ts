import confirmationCodesStorage from "src/db/dynamoDB/confirmationCodesStorage";
import photographersRepository from "src/db/repositories/photographersRepository";
import usersRepository from "src/db/repositories/usersRepository";
import { Roles } from "src/enums/roles";
import { ApiError } from "src/errors/apiError";
import { PhotographerError } from "src/errors/photographersError";
import { TokensResponse } from "src/models/tokensResponse";
import codesService from "./codesService";
import jwtTokensService from "./utils/jwtTokensService";
import passwordService from "./utils/passwordService";
import usersService from "./usersService";
import { LoginAndRegistrationModel } from "src/models/users";

class AuthService {
  signInPhotographer = async (
    password: string,
    login: string
  ): Promise<TokensResponse> => {
    const photographer = await photographersRepository.getByLogin(login);
    if (!photographer) {
      throw ApiError.NotFound("Photographer");
    }
    const { passwordHash, personId } = photographer;
    const isPasswordCorrect = await passwordService.validatePassword(
      password,
      passwordHash
    );
    if (!isPasswordCorrect) {
      throw PhotographerError.WrongPassword();
    }
    const tokens = jwtTokensService.generateAccessToken(
      personId,
      Roles.PHOTOGRAPHER
    );
    return tokens;
  };
  loginRegisterUser = async (model: LoginAndRegistrationModel) => {
    const { phoneNumber, confirmationCode } = model;
    await codesService.validateCode(phoneNumber, confirmationCode);
    const user = await usersRepository.getByPhoneNumber(phoneNumber);
    if (!user) {
      const { personId } = await usersService.createNew(phoneNumber);
      const jwtToken = jwtTokensService.generateAccessToken(
        personId,
        Roles.USER
      );
      await confirmationCodesStorage.deleteCode(phoneNumber);
      return jwtToken;
    }
    const { personId } = user;
    const jwtToken = jwtTokensService.generateAccessToken(personId, Roles.USER);
    await confirmationCodesStorage.deleteCode(phoneNumber);
    return jwtToken;
  };
}

const authService = new AuthService();
export default authService;
