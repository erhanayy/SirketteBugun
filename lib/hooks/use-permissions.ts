'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'limited' | 'prompt-with-rationale';

export interface AppPermissions {
    camera: PermissionStatus;
    photos: PermissionStatus;
    files: PermissionStatus;
}

export function usePermissions() {
    const [permissions, setPermissions] = useState<AppPermissions>({
        camera: 'prompt',
        photos: 'prompt',
        files: 'prompt',
    });
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        setIsNative(Capacitor.isNativePlatform());
        checkAllPermissions();
    }, []);

    const checkAllPermissions = async () => {
        if (!Capacitor.isNativePlatform()) return;

        try {
            const cam = await Camera.checkPermissions();
            const fs = await Filesystem.checkPermissions();

            setPermissions({
                camera: cam.camera as PermissionStatus,
                photos: cam.photos as PermissionStatus,
                files: fs.publicStorage as PermissionStatus,
            });
        } catch (error) {
            console.error('Permission check failed:', error);
        }
    };

    const requestPermission = async (type: keyof AppPermissions) => {
        if (!Capacitor.isNativePlatform()) return 'granted';

        try {
            if (type === 'camera' || type === 'photos') {
                const result = await Camera.requestPermissions({ permissions: [type] });
                const status = result[type] as PermissionStatus;
                setPermissions(prev => ({ ...prev, [type]: status }));
                return status;
            } else if (type === 'files') {
                const result = await Filesystem.requestPermissions();
                const status = result.publicStorage as PermissionStatus;
                setPermissions(prev => ({ ...prev, files: status }));
                return status;
            }
        } catch (error) {
            console.error(`Request ${type} permission failed:`, error);
            return 'denied';
        }
        return 'prompt';
    };

    const requestAll = async () => {
        await requestPermission('camera');
        await requestPermission('photos');
        await requestPermission('files');
    };

    return {
        permissions,
        isNative,
        checkAllPermissions,
        requestPermission,
        requestAll
    };
}
