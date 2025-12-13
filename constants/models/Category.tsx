export interface Category {
    title: string;
    data: GalleryData[];
}

export interface GalleryData {
    id: number;
    text: string;
    image: any;
}
