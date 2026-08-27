Reactions
The SDK includes built-in message reactions. The main reaction surfaces are:

ReactionSelector for selecting a reaction
MessageReactions for displaying grouped reactions on a message
MessageReactionsDetail for the user-detail dialog content
Best Practices
Keep reaction options concise so the selector stays scannable.
Memoize custom sortReactions comparators.
Build a custom compact reaction UI around MessageReactions only when the default clustered or segmented styles are not enough.
Customize the selector and detail dialog together so their emoji sets stay aligned.
If you replace the clustered reactions trigger, preserve its dialog-state ARIA attributes such as aria-expanded and aria-pressed.
Use reaction_groups for grouped reaction summaries.
If you customize the detail dialog, decide whether to keep the built-in add-reaction step powered by ReactionSelectorExtendedList.
The default detail dialog does not open for messages with more than 1000 reactions, so plan a custom fallback if your product expects larger reaction counts.
Sorting Reactions
By default, reactions are sorted chronologically by the first time a reaction type was used. You can change this with sortReactions on MessageList or VirtualizedMessageList.


import { Channel, MessageComposer, MessageList } from "stream-chat-react";
const sortByReactionCount = (a, b) => b.reactionCount - a.reactionCount;
const App = () => (
  <Channel>
    <MessageList sortReactions={sortByReactionCount} />
    <MessageComposer />
  </Channel>
);
Pass reactionDetailsSort to MessageList, VirtualizedMessageList, Message, or MessageReactions to control the server-side ordering of users in the default reaction-detail dialog.

Customization
Use WithComponents to replace the default reaction surfaces for a Channel subtree:


import {
  Channel,
  ChannelHeader,
  MessageComposer,
  MessageList,
  MessageReactions,
  MessageReactionsDetail,
  ReactionSelector,
  Thread,
  Window,
  WithComponents,
} from "stream-chat-react";
const CustomReactionSelector = (props) => <ReactionSelector {...props} />;
const CustomMessageReactions = (props) => (
  <MessageReactions {...props} visualStyle="segmented" />
);
const CustomMessageReactionsDetail = (props) => (
  <MessageReactionsDetail {...props} />
);
const CustomReactionSelectorExtendedList = (props) => (
  <ReactionSelector.ExtendedList {...props} />
);
const App = () => (
  <WithComponents
    overrides={{
      MessageReactionsDetail: CustomMessageReactionsDetail,
      MessageReactions: CustomMessageReactions,
      ReactionSelector: CustomReactionSelector,
      ReactionSelectorExtendedList: CustomReactionSelectorExtendedList,
    }}
  >
    <Channel>
      <Window>
        <ChannelHeader />
        <MessageList />
        <MessageComposer />
      </Window>
      <Thread />
    </Channel>
  </WithComponents>
);
Extended Reaction Picker
MessageReactionsDetail includes an add-reaction step. Clicking the add-reaction button in the detail dialog opens ReactionSelectorExtendedList.

Use ReactionSelector when you want to customize the compact picker attached to the message bubble. Use ReactionSelectorExtendedList when you want to customize the expanded picker shown inside the detail dialog.

Detail Dialog Behavior
MessageReactionsDetail now treats selectedReactionType={null} as the "show all reactions" state.

clicking the currently selected reaction type again clears the filter and returns to the all-reactions view
when no reaction type is selected, each user row can show the emoji for the reaction that user sent
the clustered MessageReactions trigger reflects dialog state with aria-expanded and aria-pressed
If you rebuild the detail view from scratch, preserve that null filter state instead of treating it as "nothing selected".

The default flow is:

clustered MessageReactions opens the detail dialog in the all-reactions state
segmented MessageReactions opens the detail dialog filtered to the clicked reaction type
the add-reaction button inside MessageReactionsDetail switches the dialog body to ReactionSelectorExtendedList
Detail Dialog Fetch Limit
The default MessageReactions component does not open MessageReactionsDetail when a message has more than 1000 reactions.

If your product needs a different behavior for very large reaction sets, replace MessageReactions with your own trigger and detail flow instead of relying on the default guard.

Loading State
The SDK exports MessageReactionsDetailLoadingIndicator for the default reactions-detail skeleton. Use it directly in custom detail UIs when you want the same loading appearance:


import { MessageReactionsDetailLoadingIndicator } from "stream-chat-react";
const CustomReactionsDetailLoadingState = () => (
  <MessageReactionsDetailLoadingIndicator />
);
Positioning
Use verticalPosition to control whether MessageReactions renders above or below the message bubble. The SDK defaults to verticalPosition="top".


import { MessageReactions } from "stream-chat-react";
const CustomMessageReactions = (props) => (
  <MessageReactions
    {...props}
    verticalPosition="bottom"
    visualStyle="segmented"
  />
);
verticalPosition works together with the existing layout props:

use verticalPosition="bottom" to move the reactions list below the message bubble
keep verticalPosition="top" for the default layout
use flipHorizontalPosition when you want to change the horizontal anchoring relative to the message alignment
set verticalPosition={null} only when you want to remove the default top/bottom modifier class and fully control positioning in a custom wrapper
One implementation detail worth knowing: in segmented mode, the SDK only applies the built-in 4-reaction cap and overflow counter when verticalPosition="top". If you move segmented reactions to the bottom, the full processed list is rendered instead of the top-position capped variant.

ReactionSelector Props
Prop	Description	Type
handleReaction	Function that adds or removes a reaction. Overrides the value from MessageContext.	(reactionType: string, event: React.BaseSyntheticEvent) => Promise<void>
own_reactions	Own reactions used to highlight the selected state.	ReactionResponse[]
MessageReactions Props
Prop	Description	Type
flipHorizontalPosition	Controls whether the horizontal position is flipped relative to the current message alignment. Defaults to false.	boolean
handleFetchReactions	Custom loader for reaction details.	MessageContextValue["handleFetchReactions"]
own_reactions	Own reactions used to highlight the current user's reactions.	ReactionResponse[]
reaction_groups	Grouped reaction summary used to build the list.	Record<string, ReactionGroupResponse>
reactionDetailsSort	Sort options used when loading reaction details for MessageReactionsDetail.	MessageContextValue["reactionDetailsSort"]
reactions	Raw reaction objects used to build the grouped list.	ReactionResponse[]
reverse	Displays reactions in reverse order. Defaults to false.	boolean
sortReactions	Comparator used to order grouped reactions.	ReactionsComparator
verticalPosition	Controls whether the list renders above or below the message bubble. Defaults to 'top'.	'top' | 'bottom' | null
visualStyle	Controls whether the list renders in clustered or segmented mode. Defaults to 'clustered'.	'clustered' | 'segmented' | null
If you need a denser inline reactions presentation than the default clustered or segmented modes, build a custom component around the current reaction data and register it through WithComponents overrides={{ MessageReactions: CustomMessageReactions }}.

MessageReactionsDetail Props
Prop	Description	Type
handleFetchReactions	Custom loader for fetching reaction details.	MessageContextValue["handleFetchReactions"]
onSelectedReactionTypeChange	Callback used when the selected reaction type changes.	(reactionType: ReactionType | null) => void
reactionGroups	Grouped reaction summary used to keep the detail view in sync when reactions are removed.	Record<string, ReactionGroupResponse>
reactionDetailsSort	Sort options used to fetch reaction details.	MessageContextValue["reactionDetailsSort"]
reactions	Grouped reaction summary used to build the detail UI.	ReactionSummary[]
selectedReactionType	Currently selected reaction type in the detail view. Use null for the "show all reactions" state.	ReactionType | null
totalReactionCount	Total number of reactions shown in the detail dialog.	number
