// components/ProductImageUpload.jsx
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Camera, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { fileUploadAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProductImageUpload = ({
                                images = [],
                                onImagesChange,
                                maxImages = 5,
                                productId = null
                            }) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            toast.error(`${file.name} n'est pas un type d'image valide`);
            return false;
        }

        if (file.size > maxSize) {
            toast.error(`${file.name} est trop volumineux. La taille maximale est de 10 Mo`);
            return false;
        }

        return true;
    };

    const uploadSingleImage = async (file) => {
        try {
            setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

            const response = await fileUploadAPI.uploadProductImage(file);

            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

            return response.data.imageUrl;
        } catch (error) {
            console.error('Upload error:', error);
            setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[file.name];
                return newProgress;
            });
            throw error;
        }
    };

    const handleFileSelect = async (files) => {
        const fileArray = Array.from(files);

        if (images.length + fileArray.length > maxImages) {
            toast.error(`Vous ne pouvez télécharger que ${maxImages} images maximum`);
            return;
        }

        const validFiles = fileArray.filter(validateFile);
        if (validFiles.length === 0) return;

        setUploading(true);

        try {
            const uploadPromises = validFiles.map(file => uploadSingleImage(file));
            const uploadedUrls = await Promise.all(uploadPromises);

            const newImages = [...images, ...uploadedUrls];
            onImagesChange(newImages);

            toast.success(`${uploadedUrls.length} image(s) téléchargée(s) avec succès!`);
        } catch (error) {
            toast.error('Échec du téléchargement: ' + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
            setUploadProgress({});
        }
    };

    const removeImage = async (imageUrl, index) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette image?')) {
            return;
        }

        try {
            // If it's an existing product, remove from server
            if (productId) {
                await fileUploadAPI.deleteImage(imageUrl);
            }

            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);

            toast.success('Image supprimée avec succès');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Échec de la suppression de l\'image');
        }
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files);
        }
    }, [images, maxImages]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Images du produit</h3>
                <span className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </span>
            </div>

            {/* Upload Area */}
            <div
                className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${dragActive
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
          ${images.length >= maxImages ? 'pointer-events-none opacity-40' : ''}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && images.length < maxImages && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    disabled={uploading || images.length >= maxImages}
                />

                {uploading ? (
                    <div className="space-y-2">
                        <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
                        <p className="text-sm text-gray-600">Téléchargement en cours...</p>
                    </div>
                ) : images.length >= maxImages ? (
                    <div className="space-y-2">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                        <p className="text-sm text-gray-600">Limite d'images atteinte</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Cliquez pour télécharger ou glissez-déposez
                            </p>
                            <p className="text-xs text-gray-500">
                                PNG, JPG, GIF jusqu'à 10 Mo
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                        <div key={fileName} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-medium text-gray-700 truncate">{fileName}</span>
                                <span className="text-gray-500">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                        >
                            <img
                                src={imageUrl}
                                alt={`Produit ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/200x200?text=Image+Error';
                                }}
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(imageUrl, index);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all duration-200"
                                    title="Supprimer l'image"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Image Index */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                            </div>

                            {/* Primary Image Badge */}
                            {index === 0 && (
                                <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                                    Principal
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-gray-500 space-y-1">
                <p>• La première image sera utilisée comme image principale</p>
                <p>• Les images seront automatiquement redimensionnées et optimisées</p>
                <p>• Formats supportés: JPEG, PNG, GIF, WebP</p>
            </div>
        </div>
    );
};

export default ProductImageUpload;