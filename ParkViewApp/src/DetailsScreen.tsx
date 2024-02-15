import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ParkingLotMap from './ParkingLotMap/ParkingLotMap';
import TimeChart from './TimeChart.js';
import database from '@react-native-firebase/database';
// import parkingSpacesData from './ParkingLotMap/ParkingSpaces.json';
import parkingVid from './ParkingLotMap/ParkingSpaces.json';
import parkingLive from './ParkingLotMap/ParkingSpacesLive.json';

const DetailsScreen = ({ navigation, route }) => {
    const { lot: item } = route.params;
    const [occupiedSpaces, setOccupiedSpaces] = useState(new Map());
    const parkingSpacesData = item.name === 'Gym Short term' ? parkingLive : parkingVid;

    useEffect(() => {
        // Determine the path based on the parking lot name
        const dbPath = item.name === 'Gym Short term' ? '/occupied_live' : '/occupied_spaces';
        const reference = database().ref(dbPath);

        const onDataChange = reference.on('value', snapshot => {
            const dataFromDatabase = snapshot.val();
            const newOccupiedSpaces = new Map();

            parkingSpacesData.forEach((space) => {
                newOccupiedSpaces.set(space.id, dataFromDatabase && dataFromDatabase[space.id]);
            });

            setOccupiedSpaces(newOccupiedSpaces);
        });

        return () => reference.off('value', onDataChange);
    }, [item.name, parkingSpacesData]); // Ad

    const carData = [
        { time: '9:00', carCount: 30 },
        { time: '10:00', carCount: 60 },
        { time: '12:00', carCount: 65 },
        { time: '15:00', carCount: 35 },
        { time: '18:00', carCount: 10 },
    ];

    const totalSpaces = parkingSpacesData.length;
    const availableSpaces = Array.from(occupiedSpaces.values()).filter(value => !value).length;


    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.header}>Lot Details</Text>
                <View style={styles.placeholder} />
            </View>
            <Text style={styles.centerText}>Available Spaces: {availableSpaces}/{totalSpaces}</Text>
            <ParkingLotMap parkingLotData={item.parkingLotData} lotName={item.name} />
            <View style={styles.titleContainer}>
                {/* <Text style={styles.TitleMap}>Car Park Map</Text> */}
            </View>
            <View style={styles.centeredContainer}>
                <TimeChart data={carData} />
                <Text style={styles.Title}>Popular Times</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: -10,
        // marginBottom: 16,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Ensures space is distributed evenly
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#002144',
    },
    header: {
        flex: 1,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    backButton: {
        marginTop: 10,
        marginLeft: 10,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    placeholder: {
        width: 60, 
        padding: 10,
    },
    itemDetails: {
        padding: 10,
        fontSize: 18,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -60,
    },
    Title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: -16,
    },
    TitleMap: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: -75,
    },
    centerText: {
        textAlign: 'center',
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 20,
    }
});


export default DetailsScreen;