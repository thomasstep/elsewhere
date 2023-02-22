iteration 1 of algo:

sort all entries by start time: earlier times go first
mark beginning of overlap as first entry
if next entry is not overlapped (start time is after beginning of overlap endtime)
  count amount of entries between beginning of overlap, and previous entry (all of the overlapped entries)
  divide width amongst them
  add to their left position an incremental amount (push them to the right increasing amounts)
  increase zindex for next overlap
  mark beginning of overlap as the current entry
if entry is overlapped, continue

** i think this would work but wouldn't be the best representation if there was one long event because it would push everything right and make it small **

iteration 2 of algo:

sort all entries by start time: earlier times go first
<!-- sort all subsets of overlapping entries by duration (moved to set once we already have subset) -->
create new array to be pushed to
mark beginning of overlap as first entry
if entry is overlapped, continue
if entry is not overlapped (or end of array)
  make an array of previously overlapping entries (this is the subset of overlapping entries)
  sort the subset by latest end time last
  iterate through overlapping entries (the current subset)

  mark beginning of overlap as the current entry

** sort of abonded this without fully thinking through. i think i found a problem and switched quickly to iteration 3 instead **

iteration 3 of algo:

sort all entries by start time and latest end time (something that starts at the same time but runs longer goes first)
make a matrix (array of arrays) to represent schedule (one row per 5(?) minutes, one column per entry)
for each entry enter a 1 during each 5 minute period it is occurring
for each row, take the sum of the array (all events occurring at the same time) and change every entry with a 1 into that number
  this helps us find the max collisions for each entry
for each column, find the max number (max events for that column occurring at the same time) and make that its width
for each row, if it includes the max number for an event, note where in line it was (left to right)
  start from 0 offset, if other entry collisions have a number already set, skip it
for each event, take 100 / max collisions and multiply by position, that is the left offset

alt:
do all this but only whenever we encounter an overlap, not for everything which would make for a potentially sparse matrix


[[1,1,1,0,0,0],[1,1,0,1,0,0],[1,0,0,0,0,0],[1,0,0,0,1,1],[1,0,0,0,1,1],[1,0,0,0,1,0]]

top is event
left is time block
 [0,1,2,3,4,5]
0[1,1,1,0,0,0]
1[1,1,0,1,0,0]
2[1,0,0,0,0,0]
3[1,0,0,0,1,1]
4[1,0,0,0,1,1]
5[1,0,0,0,1,0]

 [0,1,2,3,4,5]
0[3,3,3,0,0,0]
1[3,3,0,3,0,0]
2[1,0,0,0,0,0]
3[3,0,0,0,3,3]
4[3,0,0,0,3,3]
5[2,0,0,0,2,0]

max for each event:
0: 3
1: 3
2: 3
3: 3
4: 3
5: 3

entry position compared to others in max row:
0: 0
1: 1
2: 2
3: 2
4: 1
5: 2

take 100 / max collisions for each event and multiply by position:
0: (100/3)*0
1: (100/3)*1
2 (100/3)*2
3: (100/3)*2
4: (100/3)*1
5: (100/3)*2

result (just a visualization, each index is 1/3 width because that's how the numbers work out, number in matrix is event id, x means no event):
0[0,1,2]
1[0,1,3]
2[0,x,x]
3[0,4,5]
4[0,4,5]
5[0,4,x]

iteration 4:

sort entries by start time, if same start time sort by later end time first
stop gap happens when there is and entry with at least one entry directly after it with a start time greater than or equal to its end time (since we are sorted)
  in the stop gap, count all entries with start times before the trigger entry's end time
  make a note of the first entry with an end time after the trigger entry's end time because it will need to become the next trigger entry
  entries completely contained in the trigger entry (start time on or after and end time on or before) will need to recursively call the same schedule sorting function
if there is no stop gap/trigger entry, move on to the next entry

at worst 0(n^2)

iteration 5:

there might be something to do with an interval tree?

iteration 6:

sort all entries by start time and latest end time (something that starts at the same time but runs longer goes first)
given n entries, make an nxn matrix
start entry "i" at point ixi
extend from ixi to ixi+m where m is the last conflicting entry

i = 0
for entry in entries:
  mark entry at ixi
  j = i + 1
  for conflict in entries[i,]:
    if entry.endTime > conflict.startTime:
      mark entry at ixi+j
      j += 1
    else:
      break
  i += 1
