import { Image, View, Text, FlatList, Pressable } from "react-native";
import { Link } from "expo-router"; // For navigation to quotes page
import { memo, useCallback } from "react"; // Memoization to prevent re-renders

import { styles } from "@/styles/App.styles"; // Custom styles
import { GalleryData } from "@/constants/models/Category"; // Model for gallery items

// Defines the Gallery component props
interface QuotesGalleryProps {
    title: string;
    items: GalleryData[]; // List of items in the gallery
}

// Gallery component
const Gallery = memo(({ title, items }: QuotesGalleryProps) => {

    // Memoized key extractor function for FlatList to avoid re-creating
    const keyExtractor = useCallback((item: GalleryData) => item.id.toString(), []);

    // Memoized renderItem function for rendering each item
    const renderItem = useCallback(({ item }: { item: GalleryData }) => (
        // Link to navigate to the individual quote page
        <Link href={`/quote/${item.id}`} asChild>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`View quote ${item.id}`}
                accessibilityHint="Click to open the full quote"
                // Ripple effect for Android
                android_ripple={{ color: "#ddd", borderless: true }}
            >
                {/* Container for the quote's image */}
                <View style={styles.quotesContainer}>
                    {/* Display the image for each quote */}
                    <Image
                        source={item.image}
                        resizeMode="cover"
                        accessibilityRole="image"
                        accessibilityLabel={`Image of quote ${item.id}`} // Description for screen readers
                        style={styles.quotesImage}
                    />
                </View>
            </Pressable>
        </Link>
    ), []);

    return (
        <View style={styles.galleryContainer}>
            {/* Title for the gallery, accessible as a header */}
            <Text
                style={styles.quotesTitle}
                accessibilityRole="header"
                accessibilityLabel={`Gallery title: ${title}`} // Screen reader label
            >
                {title} {/* Display the gallery title */}
            </Text>

            {/* FlatList to render the list of items */}
            <FlatList
                data={items} // Data
                keyExtractor={keyExtractor} // Key extractor function
                renderItem={renderItem} // Render function for each item
                horizontal
                showsHorizontalScrollIndicator={false} // Hide horizontal scrollbar
                accessible
                accessibilityLabel="Scrollable gallery of relaxing quotes"
                // Optimization to calculate item positions for efficient scrolling
                getItemLayout={(_, index) => ({
                    length: 150, // Height of each item
                    offset: 150 * index, // Position of the item in the list
                    index, // The index of the item
                })}
                // Optimize rendering performance by rendering only 5 items initially
                initialNumToRender={5}
                windowSize={5} // How many items the list will keep in memory
            />
        </View>
    );
});

Gallery.displayName = 'Gallery';

export default Gallery;
