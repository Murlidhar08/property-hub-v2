"use server";

import { getUserSession } from "@/lib/auth/auth";
import {
    listDirectoryContents,
    renameItem,
    deleteFile,
    deleteDirectory,
    moveFile,
    getAbsolutePath
} from "@/lib/file-operations";
import fs from "fs";

export async function getStorageItems(relativePath: string = "") {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") throw new Error("Unauthorized");

    return await listDirectoryContents(relativePath);
}

export async function renameStorageItem(oldPath: string, newName: string) {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") throw new Error("Unauthorized");

    return await renameItem(oldPath, newName);
}

export async function deleteStorageItem(relativePath: string, isDir: boolean) {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") throw new Error("Unauthorized");

    if (isDir) {
        return await deleteDirectory(relativePath);
    } else {
        return await deleteFile(relativePath);
    }
}

export async function moveStorageItem(oldPath: string, newDirPath: string) {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") throw new Error("Unauthorized");

    return await moveFile(oldPath, newDirPath);
}
