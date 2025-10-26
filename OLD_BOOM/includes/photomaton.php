<?php
class Photomaton {
    private $db;
    
    public function __construct(PDO $db) {
        $this->db = $db;
    }
    
    public function getAllData() {
        try {
            $query = "
                SELECT 
                    photomatons.id,
                    photomatons.name, 
                    photomatons.image, 
                    photomatons.remaining_prints, 
                    photomatons.warning_threshold,
                    photomatons.critical_threshold,
                    photomatons.last_updated,
                    photomatons.router_connected,
                    photomatons.pc_connected,
                    events.id AS current_event_id,
                    events.album_name AS current_event,
                    events.total_numerique,
                    events.total_prints AS total_imprimee,
                    events.total_gifs
                FROM photomatons
                LEFT JOIN events ON photomatons.id = events.photomaton_id
                WHERE events.created_at = (
                    SELECT MAX(e2.created_at) 
                    FROM events e2 
                    WHERE e2.photomaton_id = photomatons.id
                ) OR events.created_at IS NULL
            ";
            
            $stmt = $this->db->query($query);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Erreur de base de données : " . $e->getMessage());
            return [];
        }
    }
    
    public function updateThresholds($photomatonId, $warningThreshold, $criticalThreshold) {
        try {
            $query = "
                UPDATE photomatons 
                SET warning_threshold = :warning, critical_threshold = :critical 
                WHERE id = :id
            ";
            
            $stmt = $this->db->prepare($query);
            return $stmt->execute([
                'warning' => $warningThreshold,
                'critical' => $criticalThreshold,
                'id' => $photomatonId
            ]);
        } catch (PDOException $e) {
            error_log("Erreur de mise à jour des seuils : " . $e->getMessage());
            return false;
        }
    }

    public function getSpeedtestData($photomatonId, $limit = 24) {
        try {
            $query = "
                SELECT 
                    download_speed,
                    upload_speed,
                    ping,
                    created_at
                FROM speedtests
                WHERE photomaton_id = :id
                    AND download_speed > 0 
                    AND upload_speed > 0
                ORDER BY created_at DESC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id', $photomatonId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return array_reverse($stmt->fetchAll());
        } catch (PDOException $e) {
            error_log("Erreur de récupération des données speedtest : " . $e->getMessage());
            return [];
        }
    }

    public function getPhotosHistory($eventId) {
        try {
            if (!$eventId) {
                return [];
            }

            $query = "
                SELECT 
                    timestamp as created_at,
                    media_type as type
                FROM photos
                WHERE event_id = :event_id
                ORDER BY timestamp DESC
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute(['event_id' => $eventId]);
            
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Erreur de récupération de l'historique des photos : " . $e->getMessage());
            return [];
        }
    }
}