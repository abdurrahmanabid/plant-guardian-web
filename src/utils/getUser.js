import api from "../hooks/api"

export const getUser = async () => {
  const res = await api.get('/user/get-user', { withCredentials: true })
  if (res.status === 200) {
    return res.data
  } else {
    return {
      message: "User not found"
    }
  }
}
