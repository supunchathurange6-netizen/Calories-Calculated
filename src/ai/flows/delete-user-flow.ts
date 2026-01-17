'use server';
/**
 * @fileOverview A flow to delete a user from Firebase Authentication and Firestore.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK. It will use Application Default Credentials on GCP.
if (!admin.apps.length) {
  admin.initializeApp();
}

const DeleteUserInputSchema = z.object({
  uid: z.string().describe('The UID of the user to delete.'),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

const DeleteUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;

export async function deleteUser(input: DeleteUserInput): Promise<DeleteUserOutput> {
  return deleteUserFlow(input);
}

const deleteUserFlow = ai.defineFlow(
  {
    name: 'deleteUserFlow',
    inputSchema: DeleteUserInputSchema,
    outputSchema: DeleteUserOutputSchema,
  },
  async ({uid}) => {
    try {
      // Deleting user from auth and firestore.
      // It is better to delete the Auth user first. If that fails, we don't
      // want to have an auth user without a firestore record.
      await admin.auth().deleteUser(uid);
      await admin.firestore().collection('users').doc(uid).delete();

      return {
        success: true,
        message: `Successfully deleted user ${uid}.`,
      };
    } catch (error: any) {
      console.error(`Failed to delete user ${uid}:`, error);

      // If user not found in Auth, it might have been already deleted.
      if (error.code === 'auth/user-not-found') {
          return { success: false, message: `User with UID: ${uid} not found in Firebase Authentication.` };
      }
      
      return {
        success: false,
        message: error.message || 'An unknown error occurred while deleting the user.',
      };
    }
  }
);
