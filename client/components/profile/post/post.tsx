import React from "react";
import PostList from "./postList";
import PullToRefresh from "react-simple-pull-to-refresh";
import Loader from "@/components/ui/loader/Loader";
import useQueryFetch from "@/hooks/useQueryFetch";
import { QueryResponse, QueryData, Post, Like } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@nextui-org/react";

type response = Post & { like: Like };

type PostDataType = QueryData & {
  data: response[] | null;
};

type PostQueryResponse = QueryResponse & {
  fetchResult: PostDataType;
};

const Post = () => {
  const client = useQueryClient();
  const { fetchResult }: PostQueryResponse = useQueryFetch({
    endPoints: "post",
    key: "post",
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = async () => {
    client.invalidateQueries({
      queryKey: ["post"],
      refetchType: "all",
      exact: true,
    });
  };

  return (
    <section>
      <PullToRefresh
        onRefresh={handleRefresh}
        pullingContent={<Loader />}
        fetchMoreThreshold={3}
      >
        <ul className="flex flex-col gap-4 mt-3">
          {fetchResult?.data &&
            fetchResult.data.map((post) => (
              <PostList post={post} key={post._id} />
            ))}
        </ul>
      </PullToRefresh>
    </section>
  );
};

export default Post;
