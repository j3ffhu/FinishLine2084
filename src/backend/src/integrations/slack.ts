import { WebClient } from '@slack/web-api';
import { HttpException } from '../utils/errors.utils';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Send a slack message
 * @param slackId - the channel id of the channel to send to or the slack id of the person you want to DM
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 */
export const sendMessage = async (slackId: string, message: string, link?: string, linkButtonText?: string) => {
  const { SLACK_BOT_TOKEN } = process.env;
  if (!SLACK_BOT_TOKEN) return;

  const block = generateSlackTextBlock(message, link, linkButtonText);

  try {
    await slack.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel: slackId,
      text: message,
      blocks: [block],
      unfurl_links: false
    });
  } catch (error) {
    throw new HttpException(500, 'Error sending slack message, reason: ' + (error as any).data.error);
  }
};

/**
 * Sends a slack message as a reply in a thread
 * @param slackId - the channel id of the channel of the message to reply to
 * @param parentTs - the timestamp of the message to reply to in a thread
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 */
export const replyToMessageInThread = async (
  slackId: string,
  parentTs: string,
  message: string,
  link?: string,
  linkButtonText?: string
) => {
  const { SLACK_BOT_TOKEN } = process.env;
  if (!SLACK_BOT_TOKEN) return;

  const block = generateSlackTextBlock(message, link, linkButtonText);

  try {
    await slack.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel: slackId,
      thread_ts: parentTs,
      text: message,
      blocks: [block],
      unfurl_links: false
    });
  } catch (error) {
    throw new HttpException(500, 'Error sending slack reply to thread, reason: ' + (error as any).data.error);
  }
};

/**
 * Finds all messages with the search query from the slack bot
 * @param query - the query to search messages for
 * @returns an array of matches with the channel id and timestamp of each match
 */
export const findMessagesChannelIdTs = async (query: string) => {
  const { SLACK_BOT_TOKEN } = process.env;
  if (!SLACK_BOT_TOKEN) return;

  try {
    const result = await slack.search.messages({
      token: SLACK_BOT_TOKEN,
      query: `from:@finishline_by_ner ${query}`,
      sort: 'timestamp',
      sort_dir: 'asc'
    });
    if (result.ok && result.messages?.matches)
      return result.messages.matches.map((match) => ({ channelId: match.channel?.id, ts: match.ts }));
    return [];
  } catch (error) {
    throw new HttpException(500, 'Error searching slack messages, reason: ' + (error as any).data.error);
  }
};

/**
 * Generates a slack text block with message and optional button
 * @param message - the text content of the message being sent
 * @param link - the link for the button on the message
 * @param linkButtonText - the text for the button on the message
 * @returns the slack text block
 */
const generateSlackTextBlock = (message: string, link?: string, linkButtonText?: string) => {
  // if link and link button are provided, add the button to the message, otherwise just send the markdown block
  return link && linkButtonText
    ? {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            emoji: true,
            text: linkButtonText
          },
          url: link
        }
      }
    : {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      };
};

export default slack;
