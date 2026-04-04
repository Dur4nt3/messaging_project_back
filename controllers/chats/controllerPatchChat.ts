import type { Request, Response } from 'express';
import { error401, error400 } from '../utilities/misc/serverResponses';
import { return500OrBlank200 } from '../utilities/misc/responseBranching';
import { getCurrentUserChatParticipantData } from '../../db/queries/chatParticipant/chatParticipantQueries';
import { updateChatVisibility } from '../../db/queries/chatParticipant/chatParticipantMutations';

export default async function controllerPatchChat(req: Request, res: Response) {
    const isAuthenticated = !!req.user;

    if (!isAuthenticated || req.user === undefined) {
        return error401(res);
    }

    const { chatId } = req.params;

    if (!chatId || Number.isNaN(Number(chatId))) {
        return error400(res, 'Invalid request URL!');
    }

    const chatParticipantData = await getCurrentUserChatParticipantData(
        Number(chatId),
        req.user.userId,
    );

    if (chatParticipantData === null) {
        return error400(res, 'Chat not found!');
    }

    const updated = await updateChatVisibility(
        Number(chatId),
        req.user.userId,
        chatParticipantData.visible,
    );
    return return500OrBlank200(updated, res);
}
