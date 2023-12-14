import { postData } from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/store/useAppContext";

import { useState } from "react";
import useToast from "./useToast";

type MutateType = {
  endPoint: string;
  data: any;
};

const useQueryPost = () => {
  const {
    state: { user },
  } = useAppContext();
  const client = useQueryClient();
  const [key, setKey] = useState("");
  const { notify } = useToast();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (params: MutateType) => {
      try {
        const data = await postData({
          endPoints: params.endPoint,
          params: params.data,
          token: user?.token,
        });

        if (data.status) {
          return data;
        } else {
          notify(JSON.stringify(data));
          throw new Error(
            data.message || "Something went wrong,Try again later"
          );
        }
      } catch (error: any) {
        notify(JSON.stringify(error));
        if (error.status > 201) {
          throw error.data.message;
        }
        throw error.message;
      }
    },
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: [key],
        exact: true,
        refetchType: "all",
      });
    },
    onError: (data: string) => {
      notify(JSON.stringify(data));

      notify(data?.toString());
    },
  });
  return { mutateAsync, isPending, setKey };
};

export default useQueryPost;
