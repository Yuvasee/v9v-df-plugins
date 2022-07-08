/**
Test cases.
- Settings UI
  - On plugin run shows Settings UI toggle
  - Opens and closes Settings UI when toggle is clicked
  - Settings UI is closed by default
  - Settings are persisted to local storage 
- Vectors UI
  - When no planet is selected, shows "Select a planet"
  - When a planet is selected, shows C, E, S, Es, Se and X (delete) buttons
  - Clickable vector buttons are highlighted on hover
  - Clicked create vector button becomes active (outlinded)
  - In create vector mode shows "Click on a planet to create a vector"
  - In create vector mode, clicking on a free space disables it
  - In create vector mode, clicking on a planet creates a vector 
  - Active vector button becomes inactive and filled with color of vector type
  - One planet can have 1 outgoing vector of any type, or C+S/E+S pairs
  - Creating new vector deletes previous outgoing vector (beside C+S, E+S pairs)
  - Clicking X button deletes all outgoing vectors
- E vector logic
  - If possible, sends amount of energy to capture and top up target planet
  - If donor energy is not enough, sends max energy possible
  - When sending max energy, keeps at least min energy percent (adjustable in Settings)
  - Sends when donor reaches max energy percent (adjustable in Settings)
  - Not sends more energy than target planet can hold (counts incoming silver in up to 10 seconds)
  - Not creates unnecessary transaction attempts
- S vector logic
  - If possible, sends silver amount to top up target planet silver
  - If donor silver is not enough to top up tarhet, sends amount fro the target planet to reach next rank level(s)
  - If donor reached top silver, sends all of it
  - Not sends more silver than target planet can hold (counts incoming silver)
  - Not creates unnecessary transaction attempts
- Automatic planet updates
  - Updates planet when it gets enough silver
  - Maximizes distance, then speed
  - Works correctly with multiple planets in parallel
  - Works correctly with planets of all ranks (3, 4, 5 updates possible)
  - Not creates unnecessary transaction attempts
- Automatic victory claim
  - Checks for victory conditions and claims victory when ready
 */

export {};
