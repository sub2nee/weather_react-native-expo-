import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        console.log('값을 저장하는 중에 오류가 발생:', error);
    }
};

export const getData = async key => {
    try {
        const value = await AsyncStorage.getItem(key);
    } catch (error) {
        console.log('값을 검색하는 중 오류가 발생:', error);
        Alert.alert('검색 오류가 발생했습니다.', '앱을 껏다 켜볼까요?');
    }
};
