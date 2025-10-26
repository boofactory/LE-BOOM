# Agent Photomaton - LE BOOM

**Status**: Phase 2 - À implémenter

## Description

Agent Python installé sur les photomatons Windows pour:
- Écouter les triggers DSLR Booth
- Stocker localement les stats dans SQLite
- Synchroniser avec l'API centrale quand connecté
- Monitorer le niveau de papier

## TODO

- [ ] Créer service Windows Python
- [ ] SQLite local storage
- [ ] Listener DSLR Booth triggers
- [ ] Sync API avec retry intelligent
- [ ] Auto-découverte Tailscale
- [ ] Packaging avec PyInstaller

## Installation (Future)

```powershell
# Télécharger agent
wget https://boom.boofactory.ch/agent/boom-agent-setup.exe

# Installer comme service Windows
.\boom-agent-setup.exe
```

Voir documentation complète: [docs/AGENT.md](../docs/AGENT.md) (à créer)
