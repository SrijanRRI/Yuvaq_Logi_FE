import { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../API';

const useGetUserName = (userId) => {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchUserName = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API.GETUSERBYID}/${userId}`, {
          withCredentials: true,
        });
        const user = res.data?.data;
        console.log("Fetched User Name:", user?.name);
        setUserName(user?.name || '');
      } catch (error) {
        console.error('Failed to fetch user name:', error);
        setUserName('RR User');
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, [userId]);

  return userName;
};

export default useGetUserName;
