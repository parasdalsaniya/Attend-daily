import { uploadImage, deleteImages } from "../utils/imageUpload.js";
import { createError, handleCallback, sendResponse } from "../utils/utils.js";
import postModel from "../models/postModel.js";
import commentModel from "../models/commentModel.js";
import commentReplies from "../models/commentReplies.js";
import postLikeModel from "../models/postLikeModel.js";

/// Utility Function
export const toggleLikeInComment = async ({
  model,
  commentId,
  userId,
  active,
}) => {
  try {
    let comment;

    if (active === "true") {
      comment = await model.findOne({ postId: commentId });
    } else if (active === "yes") {
      comment = await model.findOne({ userId });
    } else {
      comment = await model.findOne({ _id: commentId });
    }

    if (!comment) {
      throw new Error("Comment not found");
    }

    let likeIndex;

    if (active === "yes") {
      likeIndex = comment.bookMarks.indexOf(commentId);

      if (likeIndex !== -1) {
        comment.bookMarks.splice(likeIndex, 1);
      } else {
        comment.bookMarks.push(commentId);
      }
    } else {
      likeIndex = comment.like.indexOf(userId);

      if (likeIndex !== -1) {
        comment.like.splice(likeIndex, 1);
      } else {
        comment.like.push(userId);
      }
    }

    const updatedComment = await comment.save();
    return updatedComment;
  } catch (error) {
    throw error;
  }
};

export const createPost = handleCallback(async (req, res) => {
  const user = req.user;

  const packet = {
    userId: user._id,
    title: req.body.title,
    postType: req.body.type,
  };

  const newPost = new postModel(packet);
  await newPost.save();
  const postLike = new postLikeModel({ postId: newPost._id });
  await postLike.save();
  await postModel.findByIdAndUpdate(newPost._id, { like: postLike._id });

  sendResponse({
    status: true,
    code: 201,
    message: "Post created Successfully",
    data: newPost,
    res,
  });
});

export const addComment = handleCallback(async (req, res) => {
  const commentedUser = req.user;
  const { content, postId } = req.body;

  const packet = {
    commentedUser: commentedUser._id,
    content,
    postId,
  };
  const newComment = new commentModel(packet);
  await newComment.save();
  await postModel.findByIdAndUpdate(postId, {
    $inc: { totalComments: 1 },
  });

  sendResponse({
    status: true,
    code: 201,
    message: "Comment added Successfully",
    data: newComment,
    res,
  });
});

export const addCommentReplies = handleCallback(async (req, res) => {
  const commentReplyUser = req.user;
  const { content, postId, commentId, type } = req.body;

  const packet = {
    commentedUser: commentReplyUser._id,
    content,
    commentId,
    postId,
  };

  const newComment = new commentReplies(packet);
  await newComment.save();
  await postModel.findByIdAndUpdate(postId, {
    $inc: { totalComments: 1 },
  });
  if (type === "parent") {
    await commentModel.findByIdAndUpdate(commentId, {
      $inc: { totalComments: 1 },
    });
  } else {
    await commentReplies.findByIdAndUpdate(commentId, {
      $inc: { totalComments: 1 },
    });
  }

  sendResponse({
    status: true,
    code: 201,
    message: "Comment added Successfully",
    data: newComment,
    res,
  });
});

export const addCommentLike = handleCallback(async (req, res) => {
  const likeUser = req.user;
  const { type, postId: commentId } = req.body;

  let newLike;

  if (type === "parent") {
    newLike = await toggleLikeInComment({
      model: commentModel,
      userId: likeUser._id,
      commentId,
    });
  } else {
    newLike = await toggleLikeInComment({
      model: commentReplies,
      userId: likeUser._id,
      commentId,
    });
  }

  sendResponse({
    status: true,
    code: 200,
    message: "You have Liked comment Successfully",
    data: newLike,
    res,
  });
});

export const addPostLike = handleCallback(async (req, res) => {
  const likeUser = req.user;
  const { postId } = req.body;

  const newLike = await toggleLikeInComment({
    model: postLikeModel,
    userId: likeUser._id,
    commentId: postId,
    active: "true",
  });

  sendResponse({
    status: true,
    code: 200,
    message: "You have Liked comment Successfully",
    data: newLike,
    res,
  });
});

export const getSinglePost = handleCallback(async (req, res, next) => {
  const { id } = req.params;
  const post = await postModel
    .findById(id)
    .populate("like")
    .populate({
      path: "userId",
      select: "image name userName",
    })
    .exec();

  if (!post)
    return next(createError({ status: 400, message: "Post not found" }));

  sendResponse({
    status: true,
    code: 200,
    message: "Post fetched Successfully",
    data: post,
    res,
  });
});

export const getSingleComment = handleCallback(async (req, res) => {
  const { id, type } = req.params;

  let comment;
  let commentChild;

  if (type === "parent") {
    comment = await commentModel.findById(id).populate({
      path: "commentedUser",
      select: "image name userName",
    });
    commentChild = await commentReplies
      .find({ commentId: comment._id })
      .populate({
        path: "commentedUser",
        select: "image name userName",
      })
      .sort({ createdAt: -1 });
  } else {
    comment = await commentReplies.findById(id).populate({
      path: "commentedUser",
      select: "image name userName",
    });
    commentChild = await commentReplies
      .find({ commentId: comment._id })
      .populate({
        path: "commentedUser",
        select: "image name userName",
      })
      .sort({ createdAt: -1 });
  }

  if (!comment)
    return next(createError({ status: 400, message: "Comment not found" }));

  sendResponse({
    status: true,
    code: 200,
    message: "Comments fetched Successfully",
    data: { comment, commentChild },
    res,
  });
});

export const getUserPosts = handleCallback(async (req, res, next) => {
  const user = req.user;

  const posts = await postModel
    .find({ userId: user._id })
    .populate("like")
    .sort({ createdAt: -1 })
    .exec();

  sendResponse({
    status: true,
    code: 200,
    message: "User Posts fetched Successfully",
    data: posts,
    res,
  });
});

export const getPosts = handleCallback(async (req, res) => {
  const posts = await postModel
    .find()
    .populate("like")
    .populate({
      path: "userId",
      select: "image name userName",
    })
    .sort({ createdAt: -1 })
    .exec();

  sendResponse({
    status: true,
    code: 200,
    message: "Posts fetched Successfully",
    data: posts,
    res,
  });
});

export const getComments = handleCallback(async (req, res) => {
  const { postId } = req.params;

  const comments = await commentModel
    .find({ postId: postId })
    .populate({
      path: "commentedUser",
      select: "image name userName",
    })
    .sort({ createdAt: -1 });

  sendResponse({
    status: true,
    code: 200,
    message: "Post comments fetched Successfully",
    data: comments,
    res,
  });
});
