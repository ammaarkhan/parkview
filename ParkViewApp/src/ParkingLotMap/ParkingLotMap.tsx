import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import database from '@react-native-firebase/database'; // Import the Firebase database module
import carImage from './car.png';
import parkingVid from './ParkingSpaces.json';
import parkingLive from './ParkingSpacesLive.json';

const { width: screenWidth } = Dimensions.get('window');

const ParkingLotMap = ({ parkingLotData, lotName }) => {
    const [occupiedSpaces, setOccupiedSpaces] = useState(new Map());
    const parkingSpacesData = lotName === 'Gym Short term' ? parkingLive : parkingVid;

    useEffect(() => {
        // Determine the path based on the parking lot name
        const dbPath = lotName === 'Gym Short term' ? '/occupied_live' : '/occupied_spaces';
        const reference = database().ref(dbPath);

        const onDataChange = reference.on('value', snapshot => {
            const dataFromDatabase = snapshot.val();
            const newOccupiedSpaces = new Map();

            parkingSpacesData.forEach(space => {
                newOccupiedSpaces.set(space.id, dataFromDatabase && dataFromDatabase[space.id]);
            });

            setOccupiedSpaces(newOccupiedSpaces);
        });

        return () => reference.off('value', onDataChange);
    }, [lotName]); // Add lotName as a dependency

    const maxWidth = Math.max(...parkingSpacesData.map(s => s.position[0] + s.width));
    const maxHeight = Math.max(...parkingSpacesData.map(s => s.position[1] + s.height));
    const scaleX = screenWidth / maxWidth;
    const scaleY = scaleX;
    const spaceGap = 0;

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
            <View style={{ width: maxWidth * scaleX, height: maxHeight * scaleY }}>
                {parkingSpacesData.map((space, index) => {
                    const isOccupied = occupiedSpaces.get(space.id);

                    const left = space.position[0] * scaleX;
                    const top = space.position[1] * scaleY;
                    const width = space.width * scaleX - spaceGap;
                    const height = space.height * scaleY - spaceGap;

                    const spaceStyle = {
                        left,
                        top,
                        width,
                        height,
                        backgroundColor: isOccupied ? '#FF4C4C' : '#4CAF50',
                    };

                    return (
                        <View key={`space-${space.id}`} style={[styles.space, spaceStyle]}>
                            {isOccupied && (
                                <Image source={carImage} style={styles.car} resizeMode="contain" />
                            )}
                        </View>
                    );
                })}
                {renderParkingLines(parkingSpacesData, scaleX, scaleY, spaceGap)}
            </View>
        </ScrollView>
    );
};

const renderParkingLines = (parkingSpacesData, scaleX, scaleY, spaceGap) => {
    return parkingSpacesData.map((space, index) => (
        <View
            key={`line-${index}`}
            style={{
                position: 'absolute',
                left: (space.position[0] + space.width) * scaleX - spaceGap,
                top: space.position[1] * scaleY,
                width: spaceGap,
                height: space.height * scaleY,
                backgroundColor: 'yellow',
            }}
        />
    ));
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    space: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 4,
    },
    car: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
    },
});

export default ParkingLotMap;
