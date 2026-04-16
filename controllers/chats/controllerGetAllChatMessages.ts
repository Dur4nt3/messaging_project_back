import type { Request, Response } from 'express';
import {
    error400,
    error401,
    error500,
} from '../utilities/misc/serverResponses';

import { areThereAdditionalMessages } from '../../db/queries/message/messageQueries';
import { updateLastReadAt } from '../../db/queries/chatParticipant/chatParticipantMutations';

import getStringQueryParams from '../utilities/misc/getStringQueryParams';
import getMessagesBasedOnQuery from '../utilities/misc/getMessagesBasedOnQuery';
import formatAllMessagesResponse from '../utilities/formatters/formatAllMessagesResponse';

export default async function controllerGetAllChatMessages(
    req: Request,
    res: Response,
) {
    const isAuthenticated = !!req.user;

    if (!isAuthenticated || req.user === undefined) {
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

    let canFetchMore = false;
    if (messages.length > 0) {
        canFetchMore = await areThereAdditionalMessages(
            Number(chatId),
            messages[0].messageId,
        );
    }

    return res.json({
        success: true,
        name: formattedResponse.name,
        messages: formattedResponse.messages,
        more: canFetchMore,
    });
}
