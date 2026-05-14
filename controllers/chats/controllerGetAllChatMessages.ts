import type { Request, Response } from 'express';
import {
    error400,
    error401,
    error500,
} from '../utilities/misc/serverResponses';

import { areThereAdditionalMessages } from '../../db/queries/message/messageQueries';
import { updateLastReadAt } from '../../db/queries/chatParticipant/chatParticipantMutations';

import getStringQueryParams from '../utilities/query/getStringQueryParams';
import getMessagesBasedOnQuery from '../utilities/query/getMessagesBasedOnQuery';
import formatAllMessagesResponse from '../utilities/formatters/formatAllMessagesResponse';

import isUserAuthenticated from '../utilities/authentication/isUserAuthenticated';

export default async function controllerGetAllChatMessages(
    req: Request,
    res: Response,
) {
    if (!isUserAuthenticated(req.user)) {
        return error401(res);
    }

    const { chatId } = req.params;
    if (!chatId || Number.isNaN(Number(chatId))) {
        return error400(res, 'Invalid request URL!');
    }

    const limit = 50;

    const from = getStringQueryParams(req.query.from);
    const to = getStringQueryParams(req.query.to);

    const messages = await getMessagesBasedOnQuery(
        from,
        to,
        Number(chatId),
        limit,
    );

    if (messages === null) {
        return error500(res);
    }

    const formattedResponse = await formatAllMessagesResponse(
        Number(chatId),
        req.user.userId,
        messages,
    );
    if (formattedResponse === null) {
        return error500(res);
    }

    // Even if this doesn't succeed
    // DO NOT prevent the user from seeing the messages
    await updateLastReadAt(Number(chatId), req.user.userId);

    const firstMessageId = getStringQueryParams(req.query.firstMessageId);

    let canFetchMore = false;

    // If the Id can be derived from the query params
    // base "canFetchMore" on it
    // If not, assume the user is not knowledgeable of their message
    // base "canFetchMore" on the retrieved messages
    if (firstMessageId && !Number.isNaN(firstMessageId)) {
        canFetchMore = await areThereAdditionalMessages(
            Number(chatId),
            Number(firstMessageId),
        );
    } else if (messages.length > 0) {
        canFetchMore = await areThereAdditionalMessages(
            Number(chatId),
            messages[0].messageId,
        );
    }

    return res.json({
        success: true,
        userId: formattedResponse.userId,
        chatId: formattedResponse.chatId,
        name: formattedResponse.name,
        messages: formattedResponse.messages,
        more: canFetchMore,
        friends: formattedResponse.friends,
    });
}
