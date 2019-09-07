# Hint
Hint is a [Roll20](http://roll20.net/) script that allows the GM to send a hint to designated characters along with a ping to a map location. As an example, you can whisper the message "You notice a loose tile..." to every player whose character has a high enough passive Perception check to discover your trap, and only those players will see a ping in the location of said tile.

This script takes advantage of the new `visibleTo` parameter of the [sendPing API function](https://wiki.roll20.net/API:Utility_Functions#Miscellaneous) to only ping the players who control those characters.

## Use
Place a token in the location where you want the ping to originate. This can be any graphic, including a transparent one. Select this token and send the `!hint` command along with the necessary parameters. Format your command thus:
```
!hint --msg|<message-text> --to|<character-names>
```
The Hint script will ping the designated players, and will move the map to the location of the ping (as if long-clicking with the Shift key depressed) for each of them as well. Players who do not control a character designated in the command will see neither the ping nor the whispered message.

### Message
The text that follows `--msg|` can contain normal punctuation, but should avoid double dashes (--). This message will be whispered to each player that controls a character whose name you provide. Because of the intended use of the script, it will ignore characters who are controlled by all players.

The GM will receive a whisper with the original message and a list of the proper character names to whom the message was whispered.

### Character Names
The character names is a comma-delimited list of names that follows the `--to|` parameter. These names can be shortened versions of the character's full name as long as it contains part of the name. Capitalization does not matter. For instance, passing "bron" will match a character with the name 'Bronan the Destroyer'.

Be careful that you don't pass a name fragment that will match for multiple characters, as the script will only take the first match and the second will be ignored. Sending the name "cor" will match both "Rancor the Pungent" and "Albacore the Tuna" but will only use one of them for the hint message/ping.

### Re-Pinging
The message received by the GM will contain a "Re-Ping" button that will allow you to re-send a ping to the players. This is helpful for when a player forgot the location of the ping or somehow missed seeing the original. You just know it'll happen. Note that the ping *will follow* the selected token, so if the token moves, so will the ping.

## Help
Sending `!hint` with no parameters will display a Help dialog to the GM with simple directions for using the script.
