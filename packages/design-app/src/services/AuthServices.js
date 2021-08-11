import { loginApi, registrationApi, loadUserApi } from '@ravibasil/common/api/auth';

export const signIn = async (credential) => {
  try {
    const res = await loginApi(credential);
    const { user, token } = res.data
    localStorage.setItem("token", token);

    return user;
  }
  catch (err) {
  };
};


export default {
  signIn
}