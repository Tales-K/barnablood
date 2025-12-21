import imageCompression from 'browser-image-compression';

const MAX_SIZE_MB = 0.03; // Target ~30KB
const MAX_WIDTH_OR_HEIGHT = 300;

export async function processMonsterImage(file: File): Promise<string> {
    // Validation
    if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Image too large (max 10MB)');
    }

    const options = {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
        initialQuality: 0.8,
    };

    try {
        const compressed = await imageCompression(file, options);

        // Convert to base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(compressed);
        });
    } catch (error) {
        throw new Error('Failed to process image');
    }
}

// Validate base64 image size (should be under 50KB after processing)
export function validateBase64Size(base64: string): boolean {
    const sizeInBytes = (base64.length * 3) / 4;
    const sizeInKB = sizeInBytes / 1024;
    return sizeInKB <= 50;
}
