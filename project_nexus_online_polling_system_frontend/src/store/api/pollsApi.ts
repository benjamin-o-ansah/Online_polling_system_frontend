import { baseApi } from "./baseApi";
import type { Poll } from "@/types/models";

export const pollsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPolls: builder.query<Poll[], void>({
      query: () => ({ url: import.meta.env.VITE_API_POLLS || "/api/polls", method: "GET" }),
      providesTags: ["Polls"],
    }),
    getPoll: builder.query<Poll, string>({
      query: (pollId) => ({
        url: (import.meta.env.VITE_API_POLL_DETAIL || "/api/polls/{poll_id}").replace(
          "{poll_id}",
          pollId
        ),
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "Poll", id }],
    }),
    createPoll: builder.mutation<Poll, Partial<Poll>>({
      query: (body) => ({
        url: import.meta.env.VITE_API_POLLS || "/api/polls",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Polls"],
    }),
    updatePoll: builder.mutation<Poll, { pollId: string; body: Partial<Poll> }>({
      query: ({ pollId, body }) => ({
        url: (import.meta.env.VITE_API_POLL_UPDATE || "/api/polls/{poll_id}").replace(
          "{poll_id}",
          pollId
        ),
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Poll", id: arg.pollId }],
    }),
    deletePoll: builder.mutation<void, string>({
      query: (pollId) => ({
        url: (import.meta.env.VITE_API_POLL_DELETE || "/api/polls/{poll_id}").replace(
          "{poll_id}",
          pollId
        ),
        method: "DELETE",
      }),
      invalidatesTags: ["Polls"],
    }),
    publishPoll: builder.mutation<void, string>({
      query: (pollId) => ({
        url: (import.meta.env.VITE_API_POLL_PUBLISH || "/api/polls/{poll_id}/publish").replace(
          "{poll_id}",
          pollId
        ),
        method: "POST",
      }),
      invalidatesTags: (_r, _e, pollId) => [{ type: "Poll", id: pollId }, "Polls"],
    }),
    closePoll: builder.mutation<void, string>({
      query: (pollId) => ({
        url: (import.meta.env.VITE_API_POLL_CLOSE || "/api/polls/{poll_id}/close").replace(
          "{poll_id}",
          pollId
        ),
        method: "POST",
      }),
      invalidatesTags: (_r, _e, pollId) => [{ type: "Poll", id: pollId }, "Polls", "Results"],
    }),
  }),
});

export const {
  useListPollsQuery,
  useGetPollQuery,
  useCreatePollMutation,
  useUpdatePollMutation,
  useDeletePollMutation,
  usePublishPollMutation,
  useClosePollMutation,
} = pollsApi;
