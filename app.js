/**
 * Padel Friends League - Core Application Script
 * 8 Players Partner Rotation Tournament SPA
 */

class PadelLeagueApp {
  constructor() {
    this.db = null;
    this.activeTab = 'dashboard';
    this.activeRound = 1;
    this.selectedMatchId = null;
    this.defaultCloudUrl = 'https://script.google.com/macros/s/AKfycbzjZmY2eRgrYznelKPcI_lR8AZrJm_TrMY6Hf0KT5T_J5EOM3vudrJOj15uOqMJaFxu/exec'; // Incolla qui il tuo URL di Google Apps Script per renderlo predefinito per tutti!
    
    // Bindings
    this.handleTabClick = this.handleTabClick.bind(this);
  }

  init() {
    // 1. Load database
    this.loadDatabase();

    // 2. Setup menu tabs
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', this.handleTabClick);
    });

    // 3. Render Lucide icons
    this.renderIcons();

    // 4. Render initial tab
    this.showTab('dashboard');
  }

  loadDatabase() {
    const cloudUrl = localStorage.getItem('padel_cloud_url') || this.defaultCloudUrl;
    if (cloudUrl) {
      // Fetch from Google Sheets Apps Script Web App
      fetch(cloudUrl)
        .then(response => {
          if (!response.ok) throw new Error("Errore nel caricamento dal cloud.");
          return response.json();
        })
        .then(data => {
          if (data && data.players && data.matches) {
            this.db = data;
            localStorage.setItem('padel_championship_db', JSON.stringify(this.db));
            this.renderActiveTab();
            console.log("Database sincronizzato da Google Cloud Apps Script.");
          } else {
            throw new Error("Formato dati cloud non valido.");
          }
        })
        .catch(err => {
          console.error("Errore sinc. cloud, uso locale:", err);
          this.loadLocalOrMock();
        });
      return;
    }

    const isOnline = window.location.protocol.startsWith('http');
    if (isOnline) {
      // In cloud mode: fetch database.json to synchronize standings for everyone
      fetch('database.json')
        .then(response => {
          if (!response.ok) throw new Error("database.json non trovato sul server.");
          return response.json();
        })
        .then(data => {
          this.db = data;
          this.saveDatabase();
          this.renderActiveTab();
          console.log("Database sincronizzato con database.json online.");
        })
        .catch(err => {
          console.log("Uso database locale (localStorage):", err.message);
          this.loadLocalOrMock();
        });
    } else {
      this.loadLocalOrMock();
    }
  }

  loadLocalOrMock() {
    const localData = localStorage.getItem('padel_championship_db');
    if (localData) {
      try {
        this.db = JSON.parse(localData);
        if (!this.db || !Array.isArray(this.db.players) || !Array.isArray(this.db.matches) || !this.db.prizes) {
          throw new Error("Schema database locale non valido.");
        }
      } catch (e) {
        console.error("Database corrotto. Ricarico dati mock.", e);
        this.resetToMock();
      }
    } else {
      this.resetToMock();
    }
  }

  saveDatabase() {
    localStorage.setItem('padel_championship_db', JSON.stringify(this.db));
    this.syncToCloud();
  }

  resetToMock() {
    if (window.MOCK_DATA) {
      this.db = JSON.parse(JSON.stringify(window.MOCK_DATA));
      this.saveDatabase();
      this.showToast("Database inizializzato con dati di prova!");
    } else {
      this.db = {
        players: [
          { id: "p1", name: "Giocatore 1" },
          { id: "p2", name: "Giocatore 2" },
          { id: "p3", name: "Giocatore 3" },
          { id: "p4", name: "Giocatore 4" },
          { id: "p5", name: "Giocatore 5" },
          { id: "p6", name: "Giocatore 6" },
          { id: "p7", name: "Giocatore 7" },
          { id: "p8", name: "Giocatore 8" }
        ],
        matches: this.generateEmptyCalendar(),
        prizes: {
          first: "Pala da Padel professionale",
          second: "Zaino Padel Porta-racchetta",
          third: "Tubo di palline Padel Pro"
        }
      };
      this.saveDatabase();
    }
    if (this.db) {
      this.renderActiveTab();
    }
  }

  clearDatabase() {
    if (confirm("Sei sicuro di voler cancellare tutto? Questo eliminerà tutti i risultati inseriti.")) {
      this.db = {
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
        matches: this.generateEmptyCalendar(),
        prizes: {
          first: "Premio 1° Posto",
          second: "Premio 2° Posto",
          third: "Premio 3° Posto"
        }
      };
      this.saveDatabase();
      this.showToast("Database resettato a vuoto.");
      this.renderActiveTab();
    }
  }

  generateEmptyCalendar() {
    // Perfect 7-round Social Doubles pairings layout for 8 players:
    // Every player partners with everyone else exactly once.
    const roundPairings = [
      // Round 1
      [ { p1: ["p1", "p2"], p2: ["p3", "p4"] }, { p1: ["p5", "p6"], p2: ["p7", "p8"] } ],
      // Round 2
      [ { p1: ["p1", "p3"], p2: ["p5", "p7"] }, { p1: ["p2", "p4"], p2: ["p6", "p8"] } ],
      // Round 3
      [ { p1: ["p1", "p4"], p2: ["p6", "p7"] }, { p1: ["p2", "p3"], p2: ["p5", "p8"] } ],
      // Round 4
      [ { p1: ["p1", "p5"], p2: ["p2", "p6"] }, { p1: ["p3", "p8"], p2: ["p4", "p7"] } ],
      // Round 5
      [ { p1: ["p1", "p6"], p2: ["p3", "p7"] }, { p1: ["p4", "p5"], p2: ["p2", "p8"] } ],
      // Round 6
      [ { p1: ["p1", "p7"], p2: ["p2", "p5"] }, { p1: ["p4", "p8"], p2: ["p3", "p6"] } ],
      // Round 7
      [ { p1: ["p1", "p8"], p2: ["p4", "p6"] }, { p1: ["p2", "p7"], p2: ["p3", "p5"] } ]
    ];

    const matches = [];
    roundPairings.forEach((roundData, rIdx) => {
      const roundNum = rIdx + 1;
      roundData.forEach((matchData, mIdx) => {
        matches.push({
          id: `m_r${roundNum}_${mIdx + 1}`,
          round: roundNum,
          pair1: matchData.p1,
          pair2: matchData.p2,
          played: false,
          score: null
        });
      });
    });

    return matches;
  }

  handleTabClick(e) {
    const target = e.currentTarget.getAttribute('data-target');
    this.showTab(target);
  }

  showTab(tabId) {
    this.activeTab = tabId;
    this.closeSidebar();
    
    // Toggle active link
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.getAttribute('data-target') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle active viewport
    document.querySelectorAll('.viewport').forEach(view => {
      if (view.id === tabId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Update headers text
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    
    switch (tabId) {
      case 'dashboard':
        titleEl.textContent = "Dashboard & Podio";
        subtitleEl.textContent = "Riepilogo del torneo, prossimi match e premiazioni";
        break;
      case 'calendar':
        titleEl.textContent = "Giornate & Risultati";
        subtitleEl.textContent = "Visualizzazione dei turni e inserimento punteggi delle partite";
        break;
      case 'standings':
        titleEl.textContent = "Classifica Generale";
        subtitleEl.textContent = "Graduatoria individuale ordinata per Punti, Set e Game Vinti";
        break;
      case 'players':
        titleEl.textContent = "Gestione Amici & Premi";
        subtitleEl.textContent = "Personalizza i nomi degli 8 amici e i premi finali del podio";
        break;
      case 'backup':
        titleEl.textContent = "Gestione Database";
        subtitleEl.textContent = "Esporta e importa i dati in formato JSON o resetta a zero";
        break;
    }

    this.renderActiveTab();
  }

  renderActiveTab() {
    switch (this.activeTab) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'calendar':
        this.renderCalendar();
        break;
      case 'standings':
        this.renderStandings();
        break;
      case 'players':
        this.renderPlayersForm();
        this.renderPrizes();
        break;
      case 'backup':
        this.renderCloudUrl();
        break;
    }
    this.renderIcons();
  }

  // 1. DASHBOARD RENDER
  renderDashboard() {
    const standings = this.calculateStandings();
    const totalMatches = this.db.matches.length;
    const playedMatches = this.db.matches.filter(m => m.played).length;
    
    const roundsPlayed = Math.floor(playedMatches / 2); // 2 matches per round

    document.getElementById('stat-rounds-played').textContent = `${roundsPlayed} / 7`;
    document.getElementById('stat-matches-played').textContent = `${playedMatches} / ${totalMatches}`;
    
    const leaderName = standings.length > 0 && standings[0].played > 0 ? standings[0].name : '-';
    document.getElementById('stat-leader').textContent = leaderName;

    // Render podium names
    const name1st = standings.length > 0 ? standings[0].name : 'Nessuno';
    const name2nd = standings.length > 1 ? standings[1].name : 'Nessuno';
    const name3rd = standings.length > 2 ? standings[2].name : 'Nessuno';

    document.getElementById('podium-name-first').textContent = name1st;
    document.getElementById('podium-name-second').textContent = name2nd;
    document.getElementById('podium-name-third').textContent = name3rd;

    // Render prizes text
    document.getElementById('podium-prize-first').textContent = this.db.prizes.first || '-';
    document.getElementById('podium-prize-second').textContent = this.db.prizes.second || '-';
    document.getElementById('podium-prize-third').textContent = this.db.prizes.third || '-';
  }

  // 2. CALENDAR RENDER
  renderCalendar() {
    // Render Giornate buttons
    const filterContainer = document.getElementById('giornate-filter-btns');
    if (!filterContainer) return;
    
    filterContainer.innerHTML = '';
    for (let r = 1; r <= 7; r++) {
      const btn = document.createElement('button');
      btn.className = `btn ${this.activeRound === r ? 'btn-primary' : 'btn-secondary'}`;
      btn.textContent = `G${r}`;
      btn.onclick = () => {
        this.activeRound = r;
        this.renderCalendar();
      };
      filterContainer.appendChild(btn);
    }

    // Set Title
    document.getElementById('current-round-title').textContent = `Giornata ${this.activeRound}`;

    // Get matches for active round
    const roundMatches = this.db.matches.filter(m => m.round === this.activeRound);
    const container = document.getElementById('round-matches-container');
    if (!container) return;
    
    container.innerHTML = '';

    // Check if round is fully played
    const roundPlayed = roundMatches.every(m => m.played);
    const badge = document.getElementById('round-status-badge');
    if (badge) {
      if (roundPlayed) {
        badge.className = "badge badge-success";
        badge.textContent = "Conclusa";
      } else {
        badge.className = "badge badge-warning";
        badge.textContent = "In corso";
      }
    }

    roundMatches.forEach(m => {
      const p1Names = m.pair1.map(pid => this.getPlayerName(pid)).join(' + ');
      const p2Names = m.pair2.map(pid => this.getPlayerName(pid)).join(' + ');
      
      const card = document.createElement('div');
      card.className = 'match-item-card';

      let scoreHtml = '<span class="text-muted" style="font-size: 13px;">Da disputare</span>';
      let setsDetailsHtml = '';
      
      if (m.played && m.score) {
        const s = m.score;
        scoreHtml = `${s.setsWon1} - ${s.setsWon2}`;
        
        const setDetails = [];
        setDetails.push(`${s.set1_1}-${s.set1_2}`);
        setDetails.push(`${s.set2_1}-${s.set2_2}`);
        if (s.set3_1 > 0 || s.set3_2 > 0) {
          setDetails.push(`${s.set3_1}-${s.set3_2}`);
        }
        setsDetailsHtml = `(${setDetails.join(', ')})`;
      }

      card.innerHTML = `
        <div class="pair-names">${p1Names}</div>
        <div class="match-vs">VS</div>
        <div class="pair-names" style="text-align: right;">${p2Names}</div>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div class="match-score-display">${scoreHtml}</div>
          <div class="match-score-sets">${setsDetailsHtml}</div>
          <button class="btn btn-secondary btn-sm" onclick="app.openScoreModal('${m.id}')" style="margin-top: 10px;">
            <i data-lucide="edit-3"></i> Risultato
          </button>
        </div>
      `;
      container.appendChild(card);
    });

    this.renderIcons();
  }

  // 3. STANDINGS RENDER
  renderStandings() {
    const standings = this.calculateStandings();
    const tbody = document.getElementById('standings-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (standings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Nessun giocatore registrato.</td></tr>`;
      return;
    }

    standings.forEach((row, idx) => {
      const tr = document.createElement('tr');
      
      // Highlight podium rows
      let posStyle = '';
      let badgeMarkup = (idx + 1).toString();
      
      if (idx === 0) {
        posStyle = 'background: rgba(255, 215, 0, 0.05); font-weight: 600;';
        badgeMarkup = '🥇';
      } else if (idx === 1) {
        posStyle = 'background: rgba(192, 192, 192, 0.04);';
        badgeMarkup = '🥈';
      } else if (idx === 2) {
        posStyle = 'background: rgba(205, 127, 50, 0.03);';
        badgeMarkup = '🥉';
      }

      tr.innerHTML = `
        <td style="text-align: center; font-size: 16px; ${posStyle}">${badgeMarkup}</td>
        <td style="${posStyle}"><strong>${row.name}</strong></td>
        <td style="text-align: center; color: var(--primary); font-weight: 800; font-size: 16px; ${posStyle}">${row.points}</td>
        <td style="text-align: center; ${posStyle}">${row.played}</td>
        <td style="text-align: center; ${posStyle}">${row.wins2_0}</td>
        <td style="text-align: center; ${posStyle}">${row.wins2_1}</td>
        <td style="text-align: center; ${posStyle}">${row.losses}</td>
        <td style="text-align: center; color: var(--primary); font-weight: 600; ${posStyle}">${row.setsWon}</td>
        <td style="text-align: center; ${posStyle}">${row.gamesWon}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // 4. PLAYERS FORM RENDER
  renderPlayersForm() {
    const form = document.getElementById('players-names-form');
    if (!form) return;
    
    form.innerHTML = '';
    this.db.players.forEach((p, idx) => {
      const group = document.createElement('div');
      group.className = 'form-group';
      group.innerHTML = `
        <label class="small-text text-muted" style="text-transform: uppercase;">Amico ${idx + 1}</label>
        <input type="text" id="player-input-${p.id}" class="form-control" value="${p.name}" required>
      `;
      form.appendChild(group);
    });
  }

  savePlayersNames() {
    const inputs = document.querySelectorAll('[id^="player-input-"]');
    const newNamesMap = {};
    let hasEmpty = false;
    const uniqueNames = new Set();

    inputs.forEach(input => {
      const pid = input.id.replace('player-input-', '');
      const name = input.value.trim();
      
      if (!name) {
        hasEmpty = true;
      }
      
      newNamesMap[pid] = name;
      uniqueNames.add(name.toLowerCase());
    });

    if (hasEmpty) {
      this.showToast("Compila tutti gli 8 nomi prima di salvare.", "error");
      return;
    }

    if (uniqueNames.size < 8) {
      this.showToast("I nomi dei giocatori devono essere tutti diversi.", "error");
      return;
    }

    // Save players names (ID mapped, calendar preserves matches!)
    this.db.players.forEach(p => {
      p.name = newNamesMap[p.id];
    });

    this.saveDatabase();
    this.showToast("Nomi dei giocatori aggiornati con successo!");
    this.renderActiveTab();
  }

  // PRIZES GESTION
  renderPrizes() {
    document.getElementById('config-prize-1st').value = this.db.prizes.first || '';
    document.getElementById('config-prize-2nd').value = this.db.prizes.second || '';
    document.getElementById('config-prize-3rd').value = this.db.prizes.third || '';
  }

  savePrizes() {
    this.db.prizes.first = document.getElementById('config-prize-1st').value.trim();
    this.db.prizes.second = document.getElementById('config-prize-2nd').value.trim();
    this.db.prizes.third = document.getElementById('config-prize-3rd').value.trim();

    this.saveDatabase();
    this.showToast("Premi del podio salvati!");
    this.renderDashboard();
  }

  // SCORE MODAL GESTION
  openScoreModal(matchId) {
    this.selectedMatchId = matchId;
    const m = this.db.matches.find(x => x.id === matchId);
    if (!m) return;

    // Reset inputs
    document.getElementById('score-form').reset();
    document.getElementById('modal-match-id').value = matchId;

    const p1Names = m.pair1.map(pid => this.getPlayerName(pid)).join(' + ');
    const p2Names = m.pair2.map(pid => this.getPlayerName(pid)).join(' + ');

    document.getElementById('modal-pair1-names').textContent = p1Names;
    document.getElementById('modal-pair2-names').textContent = p2Names;

    // Populate existing scores if played
    if (m.played && m.score) {
      const s = m.score;
      document.getElementById('set1-val1').value = s.set1_1;
      document.getElementById('set1-val2').value = s.set1_2;
      document.getElementById('set2-val1').value = s.set2_1;
      document.getElementById('set2-val2').value = s.set2_2;
      if (s.set3_1 > 0 || s.set3_2 > 0) {
        document.getElementById('set3-val1').value = s.set3_1;
        document.getElementById('set3-val2').value = s.set3_2;
      }
    }

    document.getElementById('score-modal').style.display = 'flex';
  }

  closeScoreModal() {
    document.getElementById('score-modal').style.display = 'none';
    this.selectedMatchId = null;
  }

  handleScoreSubmit(e) {
    e.preventDefault();
    const matchId = this.selectedMatchId;
    if (!matchId) return;

    const m = this.db.matches.find(x => x.id === matchId);
    if (!m) return;

    const s1_1 = parseInt(document.getElementById('set1-val1').value);
    const s1_2 = parseInt(document.getElementById('set1-val2').value);
    const s2_1 = parseInt(document.getElementById('set2-val1').value);
    const s2_2 = parseInt(document.getElementById('set2-val2').value);
    const s3_1 = parseInt(document.getElementById('set3-val1').value) || 0;
    const s3_2 = parseInt(document.getElementById('set3-val2').value) || 0;

    if (isNaN(s1_1) || isNaN(s1_2) || isNaN(s2_1) || isNaN(s2_2)) {
      this.showToast("Compila i punteggi per i primi due set.", "error");
      return;
    }

    // Determine who won each set
    // A standard padel set is won by reaching 6 games (or 7 if tiebreak). Let's just compare scores.
    let sw1 = 0;
    let sw2 = 0;

    if (s1_1 > s1_2) sw1++; else sw2++;
    if (s2_1 > s2_2) sw1++; else sw2++;

    // Check if set 3 is needed
    if (sw1 === 1 && sw2 === 1) {
      if (s3_1 === 0 && s3_2 === 0) {
        this.showToast("I primi due set sono in pareggio (1-1). È necessario inserire il punteggio del terzo set.", "error");
        return;
      }
      if (s3_1 > s3_2) sw1++; else sw2++;
    } else {
      // Clear third set values if not needed to avoid bugs
      if (s3_1 > 0 || s3_2 > 0) {
        this.showToast("I primi due set sono stati vinti dalla stessa coppia. Il terzo set non è necessario e non verrà conteggiato.", "warning");
      }
    }

    const totalGames1 = s1_1 + s2_1 + (sw1 > 1 && sw2 > 0 ? s3_1 : 0);
    const totalGames2 = s1_2 + s2_2 + (sw2 > 1 && sw1 > 0 ? s3_2 : 0);

    m.played = true;
    m.score = {
      set1_1: s1_1, set1_2: s1_2,
      set2_1: s2_1, set2_2: s2_2,
      set3_1: (sw1 === 2 && sw2 === 1) || (sw2 === 2 && sw1 === 1) ? s3_1 : 0,
      set3_2: (sw1 === 2 && sw2 === 1) || (sw2 === 2 && sw1 === 1) ? s3_2 : 0,
      setsWon1: sw1,
      setsWon2: sw2,
      gamesWon1: totalGames1,
      gamesWon2: totalGames2
    };

    this.saveDatabase();
    this.closeScoreModal();
    this.showToast("Risultato della partita registrato con successo!");
    this.renderActiveTab();
  }

  // HELPER DATA SELECTORS
  getPlayerName(playerId) {
    const p = this.db.players.find(x => x.id === playerId);
    return p ? p.name : playerId;
  }

  calculateStandings() {
    const stats = {};
    
    // Initialize stats
    this.db.players.forEach(p => {
      stats[p.id] = {
        id: p.id,
        name: p.name,
        played: 0,
        wins2_0: 0,
        wins2_1: 0,
        losses: 0,
        setsWon: 0,
        gamesWon: 0,
        points: 0
      };
    });

    // Scan played matches
    this.db.matches.forEach(m => {
      if (!m.played || !m.score) return;

      const s = m.score;
      const isPair1Winner = s.setsWon1 > s.setsWon2;

      // Pair 1
      m.pair1.forEach(pid => {
        const pStat = stats[pid];
        if (!pStat) return;

        pStat.played++;
        pStat.setsWon += s.setsWon1;
        pStat.gamesWon += s.gamesWon1;

        if (isPair1Winner) {
          if (s.setsWon2 === 0) {
            pStat.wins2_0++;
            pStat.points += 3;
          } else {
            pStat.wins2_1++;
            pStat.points += 2;
          }
        } else {
          pStat.losses++;
        }
      });

      // Pair 2
      m.pair2.forEach(pid => {
        const pStat = stats[pid];
        if (!pStat) return;

        pStat.played++;
        pStat.setsWon += s.setsWon2;
        pStat.gamesWon += s.gamesWon2;

        if (!isPair1Winner) {
          if (s.setsWon1 === 0) {
            pStat.wins2_0++;
            pStat.points += 3;
          } else {
            pStat.wins2_1++;
            pStat.points += 2;
          }
        } else {
          pStat.losses++;
        }
      });
    });

    // Convert to array and sort
    const standings = Object.values(stats);
    
    standings.sort((a, b) => {
      // 1. Points desc
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      // 2. Sets Won desc
      if (b.setsWon !== a.setsWon) {
        return b.setsWon - a.setsWon;
      }
      // 3. Games Won desc
      if (b.gamesWon !== a.gamesWon) {
        return b.gamesWon - a.gamesWon;
      }
      // 4. Alphabetical name asc
      return a.name.localeCompare(b.name);
    });

    return standings;
  }

  // EXPORT & IMPORT DATABASE
  exportDatabase() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.db));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `padel_friends_db_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast("Database esportato!");
  }

  importDatabase(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (!parsed.players || !parsed.matches || !parsed.prizes) {
          throw new Error("Formato backup non valido.");
        }
        this.db = parsed;
        this.saveDatabase();
        this.showToast("Dati importati con successo!");
        this.showTab('dashboard');
      } catch (err) {
        this.showToast("Impossibile caricare il file: formato corrotto.", "error");
      }
    };
    reader.readAsText(file);
  }

  // GRAPHICS HELPERS
  renderIcons() {
    try {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    } catch (e) {
      console.warn("Lucide icons failed:", e);
    }
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    
    const icon = type === 'error' ? 'alert-triangle' : 'check';
    toast.innerHTML = `
      <i data-lucide="${icon}" style="width: 16px; height: 16px;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    this.renderIcons();

    setTimeout(() => {
      toast.style.animation = 'toastSlideIn 0.3s reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar-nav');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        sidebar.classList.toggle('open');
        overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
      } else {
        sidebar.classList.toggle('collapsed');
      }
    }
  }

  closeSidebar() {
    const sidebar = document.getElementById('sidebar-nav');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.remove('open');
      overlay.style.display = 'none';
    }
  }

  renderCloudUrl() {
    const input = document.getElementById('config-cloud-url');
    if (input) {
      input.value = localStorage.getItem('padel_cloud_url') || '';
    }
  }

  saveCloudUrl() {
    const input = document.getElementById('config-cloud-url');
    if (input) {
      const url = input.value.trim();
      if (url) {
        localStorage.setItem('padel_cloud_url', url);
        this.showToast("URL Cloud salvata! Sincronizzo...");
        this.syncToCloud();
      } else {
        localStorage.removeItem('padel_cloud_url');
        this.showToast("Sincronizzazione Cloud disattivata.");
      }
    }
  }

  syncToCloud() {
    const cloudUrl = localStorage.getItem('padel_cloud_url') || this.defaultCloudUrl;
    if (!cloudUrl) return;

    fetch(cloudUrl, {
      method: 'POST',
      mode: 'no-cors', // no-cors prevents CORS preflight issues with Google Apps Script
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.db)
    })
    .then(() => {
      console.log("Database sincronizzato in cloud via Apps Script.");
    })
    .catch(err => {
      console.error("Errore sinc. cloud:", err);
    });
  }
}

// Global App Instance
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new PadelLeagueApp();
  app.init();
  window.app = app;
});
