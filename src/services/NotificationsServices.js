import axios from "axios";
export const axiosJWT = axios.create();

// get all notification by ad min
export const getAllNotification = async (dataRequest) => {
  const { access_token } = dataRequest;
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/notifications/getNotifications`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res?.data;
};

// check readed notification
export const read_Notification = async (dataRequest) => {
  const { access_token } = dataRequest;
  const res = await axiosJWT.put(
    `${process.env.REACT_APP_API_URL}/notifications/read_notification`,
    dataRequest,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res?.data;
};

// check readed notification
export const delete_Notification = async (dataRequest) => {
  const { access_token } = dataRequest;
  const res = await axiosJWT.put(
    `${process.env.REACT_APP_API_URL}/notifications/delete_notification`,
    dataRequest,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res?.data;
};

// get all notification by id
export const getAllNotificationById = async (dataRequest) => {
  const { access_token } = dataRequest;
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/notifications/getNotificationsById`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res?.data;
};
