import { loginApi, loadUserApi } from '@monostruct/common/api/auth';

const signIn = async (credential) => {
  try {
    const res = await loginApi(credential);
    const { user, token } = res.data;
    localStorage.setItem('token', token);

    return user;
  } catch (err) {}
};

const fetchUser = async () => {
  try {
    const res = await loadUserApi();
    return res.data;
  } catch (err) {}
};

const AuthService = {
  signIn,
  fetchUser
}

export default AuthService;