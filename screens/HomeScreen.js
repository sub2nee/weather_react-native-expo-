import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import React, { useState, useEffect, useCallback } from 'react';
import { useFonts } from 'expo-font';
import { weatherImages } from '../constants/index';
import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { theme } from '../theme';
import {
    CalendarDaysIcon,
    MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { debounce } from 'lodash';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import LottieView from 'lottie-react-native';
import { getData, storeData } from '../utils/asyncStorage';

export default function HomeScreen() {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [showSearch, toggleSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true);

    const handleLocation = loc => {
        // console.log('location:', loc);
        setLocations([]);
        toggleSearch(false);
        setLoading(true);
        fetchWeatherForecast({
            cityName: loc.name,
            days: '7',
        }).then(data => {
            setWeather(data);
            setLoading(false);
            storeData('city', loc.name);
            // console.log('data : ', data);
        });
    };
    const handleSearch = value => {
        if (value.length > 2) {
            fetchLocations({ cityName: value }).then(data => {
                setLocations(data);
            });
        }
    };

    useEffect(() => {
        fetchMyWeatherData();
    }, []);

    const fetchMyWeatherData = async () => {
        let myCity = await getData('city');
        let cityName = 'seoul';
        if (myCity) cityName = myCity;

        fetchWeatherForecast({
            cityName,
            days: '7',
        }).then(data => {
            setWeather(data);
            setLoading(false);
        });
    };

    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

    const { current, location } = weather;

    //폰트 로드
    const loadFonts = async () => {
        await Font.loadAsync({
            Tmoney: require('../assets/fonts/TmoneyRoundWindExtraBold.ttf'),
            다예쁨: require('../assets/fonts/오뮤_다예쁨체.ttf'),
        });
        setFontsLoaded(true);
    };

    useEffect(() => {
        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return null;
    }
    return (
        <LottieView
            source={
                parseInt(new Date().getHours()) >= 5 &&
                parseInt(new Date().getHours()) <= 17
                    ? require('../assets/images/background-day.json')
                    : require('../assets/images/background-night.json')
            }
            autoPlay
            loop
            resizeMode="cover"
        >
            <View className="flex-1 relative">
                <StatusBar Style="auto" />
                {loading ? (
                    <View className="flex-1 flex-row justify-center items-center">
                        <LottieView
                            source={require('../assets/images/progress.json')}
                            autoPlay
                            loop
                        />
                    </View>
                ) : (
                    <SafeAreaView className="flex flex-1">
                        {/* search section */}
                        <View
                            style={{ height: '7%' }}
                            className="mx-4 relative z-50"
                        >
                            <View
                                className="flex-row justify-end items-center rounded-full"
                                style={{
                                    backgroundColor: showSearch
                                        ? theme.bgWhite(0.2)
                                        : 'transparent',
                                }}
                            >
                                {showSearch ? (
                                    <TextInput
                                        onChangeText={handleTextDebounce}
                                        placeholder="Search"
                                        placeholderTextColor={'#BEC0D1'}
                                        className="pl-6 h-10 flex-1 text-base text-white"
                                        style={{ fontFamily: 'Tmoney' }}
                                    />
                                ) : null}

                                <TouchableOpacity
                                    onPress={() => toggleSearch(!showSearch)}
                                    style={{
                                        backgroundColor: theme.bgWhite(0.3),
                                    }}
                                    className="rounded-full p-3 m-1"
                                >
                                    <MagnifyingGlassIcon
                                        size="25"
                                        color="white"
                                    />
                                </TouchableOpacity>
                            </View>
                            {locations.length > 0 && showSearch ? (
                                <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                                    {locations.map((loc, index) => {
                                        let showBorder =
                                            index + 1 != locations.length;
                                        let borderClass = showBorder
                                            ? ' border-b-2 border-b-gray-400'
                                            : '';
                                        return (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleLocation(loc)
                                                }
                                                key={index}
                                                className={
                                                    'flex-row items-center border-0 p-3 px-4 mb-1' +
                                                    borderClass
                                                }
                                            >
                                                <MapPinIcon
                                                    size="20"
                                                    color="gray"
                                                />
                                                <Text
                                                    className="text-black text-lg ml-2"
                                                    style={{
                                                        fontFamily: '다예쁨',
                                                    }}
                                                >
                                                    {loc?.name}, {loc?.country}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ) : null}
                        </View>
                        {/* forecast section */}
                        <View className="mx-4 flex justify-around flex-1 mb-2">
                            {/* location  */}
                            <Text
                                className="text-center text-3xl font-bold text"
                                style={{
                                    fontFamily: 'Tmoney',
                                    color:
                                        parseInt(new Date().getHours()) >= 5 &&
                                        parseInt(new Date().getHours()) <= 17
                                            ? '#7e8084'
                                            : 'white',
                                }}
                            >
                                {location?.name},&nbsp;
                                <Text
                                    className="text-xl font-bold tracking-w"
                                    style={{
                                        fontFamily: 'Tmoney',
                                        color:
                                            parseInt(new Date().getHours()) >=
                                                5 &&
                                            parseInt(new Date().getHours()) <=
                                                17
                                                ? '#afb1b3'
                                                : 'gray',
                                    }}
                                >
                                    {' ' + location?.country}
                                </Text>
                            </Text>
                            {/* weather image */}
                            <View className="flex-row justify-center">
                                <Image
                                    source={
                                        weatherImages[current?.condition?.text]
                                    }
                                    className="w-60 h-60 mt-3"
                                />
                            </View>

                            <View className="space-y-2">
                                <Text
                                    className="text-center font-bold text-white text-6xl ml-5"
                                    style={{ fontFamily: 'Tmoney' }}
                                >
                                    {current?.temp_c}&#176;
                                </Text>
                                <Text
                                    className="text-center text-white text-xl tracking-widest"
                                    style={{ fontFamily: '다예쁨' }}
                                >
                                    {current?.condition?.text}
                                </Text>
                            </View>
                            {/* other stats */}
                            <View className="flex-row justify-between mx-4">
                                <View className="flex-row space-x-2 items-center">
                                    <Icon
                                        name="weather-windy"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text
                                        className="text-white font-semibold text-base"
                                        style={{ fontFamily: 'Tmoney' }}
                                    >
                                        {current?.wind_kph}km
                                    </Text>
                                </View>

                                <View className="flex-row space-x-2 items-center">
                                    <Icon
                                        name="water-outline"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text
                                        className="text-white font-semibold text-base pl-2"
                                        style={{ fontFamily: 'Tmoney' }}
                                    >
                                        {current?.humidity}%
                                    </Text>
                                </View>

                                <View className="flex-row space-x-2 items-center">
                                    <Icon
                                        name="weather-sunset"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text
                                        className="text-white font-semibold text-base "
                                        style={{ fontFamily: 'Tmoney' }}
                                    >
                                        {
                                            weather?.forecast?.forecastday[0]
                                                ?.astro?.sunrise
                                        }
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* forecast for next days */}
                        <View className="mb-2 space-y-3">
                            <View className="flex-row item-center mx-5 space-x-2">
                                <CalendarDaysIcon size="22" color="white" />
                                <Text
                                    className="text-white text-base"
                                    style={{ fontFamily: '다예쁨' }}
                                >
                                    daily forecast
                                </Text>
                            </View>

                            <ScrollView
                                horizontal
                                contentContainerStyle={{
                                    paddingHorizontal: 15,
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                {weather?.forecast?.forecastday?.map(
                                    (item, index) => {
                                        let date = new Date(item.date);
                                        let options = { weekday: 'long' };
                                        let dayName = date.toLocaleDateString(
                                            'en-US',
                                            options
                                        );
                                        dayName = dayName.split(',')[0];

                                        return (
                                            <View
                                                key={index}
                                                className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                                                style={{
                                                    backgroundColor:
                                                        theme.bgWhite(0.15),
                                                }}
                                            >
                                                <Image
                                                    source={{
                                                        uri:
                                                            'https:' +
                                                            item?.day?.condition
                                                                ?.icon,
                                                    }}
                                                    className="h-12 w-12"
                                                />
                                                <Text
                                                    className="text-white"
                                                    style={{
                                                        fontFamily: 'Tmoney',
                                                    }}
                                                >
                                                    {dayName}
                                                </Text>
                                                <Text
                                                    className="text-white text-xl font-semibold"
                                                    style={{
                                                        fontFamily: 'Tmoney',
                                                    }}
                                                >
                                                    {item?.day?.avgtemp_c}&#176;
                                                </Text>
                                            </View>
                                        );
                                    }
                                )}
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                )}
            </View>
        </LottieView>
    );
}
