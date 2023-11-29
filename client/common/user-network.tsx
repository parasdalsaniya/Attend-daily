import { Card, CardBody, User } from "@nextui-org/react";
import { useUserContext } from "@/store/useUserContext";
import { NetworkUser } from "@/types/types";
import Loader from "@/components/ui/loader/Loader";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/store/useAppContext";

type NetworkProps = {
  data: NetworkUser;
  compareData: NetworkUser | undefined;
};

const UserNetworkComp: React.FC<NetworkProps> = ({ data, compareData }) => {
  const { networkData, handleFollow, isFollowing } = useUserContext();
  const router = useRouter();
  const { setState } = useAppContext();

  return (
    <>
      <Card className=" mt-3">
        <CardBody className=" p-3">
          <ul className=" flex flex-col w-full">
            {data?.map((follower) => (
              <li
                key={follower.id._id}
                className=" flex items-center justify-between"
              >
                <User
                  name={follower.id.name}
                  description={`@${follower.id.userName}`}
                  avatarProps={{
                    src: follower.id.image,
                    showFallback: true,
                    name: follower.id.name,
                  }}
                  onClick={() => {
                    setState((prev) => ({
                      ...prev,
                      open: "",
                      support: "true",
                    }));
                    router.push(`/profile/${follower.id.userName}`);
                  }}
                  className=" cursor-pointer"
                />

                {networkData.data?.userId !== follower.id._id && (
                  <>
                    {compareData?.find(
                      (follow) => follow.id._id === follower.id._id
                    ) ? (
                      <Button
                        onClick={() =>
                          handleFollow(follower.id._id, follower.id.userName)
                        }
                        disabled={isFollowing}
                        style={{ height: "35px" }}
                      >
                        {isFollowing ? <Loader /> : "Unfollow"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          handleFollow(follower.id._id, follower.id.userName)
                        }
                        disabled={isFollowing}
                        style={{ height: "35px" }}
                      >
                        {isFollowing ? <Loader /> : "Follow"}
                      </Button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </>
  );
};

export default UserNetworkComp;
