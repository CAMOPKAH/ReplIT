// Define different game states

export type GameState = 
  | 'collecting' // Player is collecting apples from the tree
  | 'selecting'  // Player is selecting the correct number
  | 'success'    // Player has selected the correct number
  | 'hint';      // Showing hint after incorrect attempts
