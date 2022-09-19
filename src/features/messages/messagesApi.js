import io from "socket.io-client";
import { apiSlice } from "../api/apiSlice";

export const messagesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: (id) =>
                `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,

                async onCacheEntryAdded(
                    arg,
                    { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
                ) {
                    // create socket
                    const socket = io("http://localhost:9000", {
                        reconnectionDelay: 1000,
                        reconnection: true,
                        reconnectionAttemps: 10,
                        transports: ["websocket"],
                        agent: false,
                        upgrade: false,
                        rejectUnauthorized: false,
                    });
    
                    try {
                        await cacheDataLoaded;
                        socket.on("message", (data) => {
                            // console.log("message: ",data?.data)
                            // console.log("message Id: ",data?.data?.conversationId)

                            updateCachedData((draft) => {
                                // console.log("draft :", JSON.stringify(draft))
                                
                                const conversation = draft.find(
                                    (c) => c.conversationId == data?.data?.conversationId
                                );
                                // console.log("get conaversation: ",JSON.stringify(conversation));

                                if (conversation?.conversationId) {
                                    draft.push(data?.data);
                                    // conversation.message = data?.data?.message;
                                    // conversation.timestamp = data?.data?.timestamp;
                                } else {
                                    // do nothing
                                }
                            });
                        });
                    } catch (err) {}
    
                    await cacheEntryRemoved;
                    socket.close();
                },
        }),
        addMessage: builder.mutation({
            query: (data) => ({
                url: "/messages",
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const { useGetMessagesQuery, useAddMessageMutation } = messagesApi;
