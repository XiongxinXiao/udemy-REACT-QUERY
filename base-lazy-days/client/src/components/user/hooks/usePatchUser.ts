import jsonpatch from 'fast-json-patch';
import { useMutation, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useUser } from './useUser';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { queryClient } from 'react-query/queryClient';
import { queryKeys } from 'react-query/constants';
// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): (newData: User | null) => void {
  const { user, updateUser } = useUser();

  const toast = useCustomToast();

  const queryClient = useQueryClient();

  // TODO: replace with mutate function
  const { mutate: patchUser } = useMutation(
    (newUserData: User) => patchUserOnServer(newUserData, user),
    {
      onMutate: async (newData: User | null) => {
        // cancel ongoing query, so stale server data wont be fetched and applied to cache
        queryClient.cancelQueries(queryKeys.user);

        // snapshot for rollback used by onError
        const previousData: User = queryClient.getQueryData(queryKeys.user);

        updateUser(newData);

        return { previousData };
      },
      onError: (error, newData, context) => {
        if (context.previousData) {
            updateUser(context.previousData);
            toast({
                title: 'User updat failed!',
                status: 'warning',
              })
        }
      },
      onSuccess: (userData: User | null) => {
        if (userData) {
          updateUser(userData);
          toast({
            title: 'User updated!',
            status: 'success',
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(queryKeys.user)
      }
    },
  );

  return patchUser;
}
function async(arg0: string, type: any): (variables: User) => unknown {
  throw new Error('Function not implemented.');
}
