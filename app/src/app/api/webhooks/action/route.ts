import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';
import { TriggerActionRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: TriggerActionRequest = await request.json();
    const { photomatonId, action } = body;

    // Valider l'action
    const validActions = ['power_on', 'power_off', 'lock', 'unlock', 'print_test'];
    if (!validActions.includes(action)) {
      return errorResponse('Invalid action', 400, 'INVALID_ACTION');
    }

    // Récupérer le photomaton
    const photomaton = await prisma.photomaton.findUnique({
      where: { id: photomatonId },
    });

    if (!photomaton) {
      return notFoundResponse('Photomaton');
    }

    // Vérifier l'état de connexion
    if (!photomaton.routerConnected && action !== 'power_on') {
      return errorResponse(
        'Photomaton router is offline',
        400,
        'PHOTOMATON_OFFLINE'
      );
    }

    // Exécuter l'action selon le type
    let result: any = {};

    switch (action) {
      case 'power_on':
        result = await sendWakeOnLan(photomaton);
        break;

      case 'power_off':
        result = await sendShutdownCommand(photomaton);
        break;

      case 'lock':
      case 'unlock':
        result = await sendDslrBoothCommand(photomaton, action);
        break;

      case 'print_test':
        result = await sendPrintTestCommand(photomaton);
        break;
    }

    // Log de l'action (future: AuditLog)
    console.log(`Action ${action} triggered for photomaton ${photomatonId}`, result);

    return successResponse({
      success: true,
      action,
      photomatonId,
      executedAt: new Date().toISOString(),
      result,
    });
  } catch (error: any) {
    console.error('Error triggering action:', error);
    return errorResponse(error.message || 'Action failed', 500, 'ACTION_FAILED');
  }
}

// ============================================
// Helper Functions pour chaque action
// ============================================

async function sendWakeOnLan(photomaton: any) {
  // TODO: Implémenter Wake-on-LAN via routeur Teltonika
  // Pour l'instant, simuler l'envoi

  if (!photomaton.routerTailscaleIp) {
    throw new Error('Router Tailscale IP not configured');
  }

  // Exemple d'implémentation future:
  // 1. Se connecter au routeur via Tailscale IP
  // 2. Envoyer commande WOL avec MAC address du PC photomaton
  // 3. Attendre confirmation

  console.log(`Sending WOL to ${photomaton.hostname} via router ${photomaton.routerTailscaleIp}`);

  // Simuler délai réseau
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    method: 'wake_on_lan',
    router: photomaton.routerTailscaleIp,
    target: photomaton.hostname,
  };
}

async function sendShutdownCommand(photomaton: any) {
  // TODO: Implémenter shutdown via SSH ou API photomaton

  if (!photomaton.tailscaleIp) {
    throw new Error('Photomaton Tailscale IP not configured');
  }

  console.log(`Sending shutdown to ${photomaton.tailscaleIp}`);

  // Exemple futur: SSH ou HTTP API vers le photomaton
  // await fetch(`http://${photomaton.tailscaleIp}:3000/shutdown`, {
  //   method: 'POST',
  // });

  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    method: 'shutdown',
    target: photomaton.tailscaleIp,
  };
}

async function sendDslrBoothCommand(photomaton: any, command: string) {
  // TODO: Implémenter commandes DSLR Booth via API

  if (!photomaton.tailscaleIp) {
    throw new Error('Photomaton Tailscale IP not configured');
  }

  console.log(`Sending DSLR Booth command '${command}' to ${photomaton.tailscaleIp}`);

  // Exemple futur: API DSLR Booth
  // await fetch(`http://${photomaton.tailscaleIp}:5000/api/booth/${command}`, {
  //   method: 'POST',
  // });

  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    method: 'dslr_booth_command',
    command,
    target: photomaton.tailscaleIp,
  };
}

async function sendPrintTestCommand(photomaton: any) {
  // TODO: Implémenter test d'impression

  if (!photomaton.tailscaleIp) {
    throw new Error('Photomaton Tailscale IP not configured');
  }

  console.log(`Sending print test to ${photomaton.tailscaleIp}`);

  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    method: 'print_test',
    target: photomaton.tailscaleIp,
  };
}
