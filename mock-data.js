// Padel Championship - Mock Data
window.MOCK_DATA = {
  players: [
    { id: "p1", name: "Luca" },
    { id: "p2", name: "Marco" },
    { id: "p3", name: "Francesco" },
    { id: "p4", name: "Alessandro" },
    { id: "p5", name: "Davide" },
    { id: "p6", name: "Andrea" },
    { id: "p7", name: "Giovanni" },
    { id: "p8", name: "Stefano" }
  ],
  matches: [
    // GIORNATA 1
    {
      id: "m_r1_1",
      round: 1,
      pair1: ["p1", "p2"],
      pair2: ["p3", "p4"],
      played: true,
      score: {
        set1_1: 6, set1_2: 4,
        set2_1: 6, set2_2: 3,
        set3_1: 0, set3_2: 0,
        setsWon1: 2, setsWon2: 0,
        gamesWon1: 12, gamesWon2: 7
      }
    },
    {
      id: "m_r1_2",
      round: 1,
      pair1: ["p5", "p6"],
      pair2: ["p7", "p8"],
      played: true,
      score: {
        set1_1: 6, set1_2: 2,
        set2_1: 4, set2_2: 6,
        set3_1: 7, set3_2: 5,
        setsWon1: 2, setsWon2: 1,
        gamesWon1: 17, gamesWon2: 13
      }
    },
    // GIORNATA 2
    {
      id: "m_r2_1",
      round: 2,
      pair1: ["p1", "p3"],
      pair2: ["p5", "p7"],
      played: true,
      score: {
        set1_1: 3, set1_2: 6,
        set2_1: 2, set2_2: 6,
        set3_1: 0, set3_2: 0,
        setsWon1: 0, setsWon2: 2,
        gamesWon1: 5, gamesWon2: 12
      }
    },
    {
      id: "m_r2_2",
      round: 2,
      pair1: ["p2", "p4"],
      pair2: ["p6", "p8"],
      played: true,
      score: {
        set1_1: 6, set1_2: 7,
        set2_1: 6, set2_2: 4,
        set3_1: 6, set3_2: 3,
        setsWon1: 2, setsWon2: 1,
        gamesWon1: 18, gamesWon2: 14
      }
    },
    // GIORNATA 3
    {
      id: "m_r3_1",
      round: 3,
      pair1: ["p1", "p4"],
      pair2: ["p6", "p7"],
      played: false,
      score: null
    },
    {
      id: "m_r3_2",
      round: 3,
      pair1: ["p2", "p3"],
      pair2: ["p5", "p8"],
      played: false,
      score: null
    },
    // GIORNATA 4
    {
      id: "m_r4_1",
      round: 4,
      pair1: ["p1", "p5"],
      pair2: ["p2", "p6"],
      played: false,
      score: null
    },
    {
      id: "m_r4_2",
      round: 4,
      pair1: ["p3", "p8"],
      pair2: ["p4", "p7"],
      played: false,
      score: null
    },
    // GIORNATA 5
    {
      id: "m_r5_1",
      round: 5,
      pair1: ["p1", "p6"],
      pair2: ["p3", "p7"],
      played: false,
      score: null
    },
    {
      id: "m_r5_2",
      round: 5,
      pair1: ["p4", "p5"],
      pair2: ["p2", "p8"],
      played: false,
      score: null
    },
    // GIORNATA 6
    {
      id: "m_r6_1",
      round: 6,
      pair1: ["p1", "p7"],
      pair2: ["p2", "p5"],
      played: false,
      score: null
    },
    {
      id: "m_r6_2",
      round: 6,
      pair1: ["p4", "p8"],
      pair2: ["p3", "p6"],
      played: false,
      score: null
    },
    // GIORNATA 7
    {
      id: "m_r7_1",
      round: 7,
      pair1: ["p1", "p8"],
      pair2: ["p4", "p6"],
      played: false,
      score: null
    },
    {
      id: "m_r7_2",
      round: 7,
      pair1: ["p2", "p7"],
      pair2: ["p3", "p5"],
      played: false,
      score: null
    }
  ],
  prizes: {
    first: "Pala da Padel Adidas Adipower + Cena offerta da tutti",
    second: "Zaino Porta-Racchetta Head + Tubo di palline",
    third: "Tubo di palline Padel Pro + Overgrip"
  }
};
