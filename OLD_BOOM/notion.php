<?php
class NotionClient {
    private $apiKey;
    private $baseUrl = 'https://api.notion.com/v1';

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    public function getDatabaseStructure($databaseId) {
        $url = "{$this->baseUrl}/databases/{$databaseId}";
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Notion-Version: 2022-06-28'
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        
        if (curl_errno($ch)) {
            throw new Exception('Erreur lors de la requête Notion: ' . curl_error($ch));
        }
        
        curl_close($ch);
        
        $data = json_decode($response, true);
        
        if (isset($data['object']) && $data['object'] === 'error') {
            throw new Exception('Erreur Notion: ' . $data['message']);
        }

        $structure = [];
        foreach ($data['properties'] as $name => $property) {
            $structure[$name] = $property['type'];
        }

        return $structure;
    }

    public function getNotes($databaseId) {
        $allResults = [];
        $startCursor = null;
        
        do {
            $url = "{$this->baseUrl}/databases/{$databaseId}/query";
            
            $headers = [
                'Authorization: Bearer ' . $this->apiKey,
                'Notion-Version: 2022-06-28',
                'Content-Type: application/json'
            ];

            $body = [
                'page_size' => 100,
                'filter' => [
                    'property' => 'État',
                    'status' => [
                        'equals' => 'En cours'
                    ]
                ],
                'sorts' => [
                    [
                        'property' => 'Date évènement',
                        'direction' => 'ascending'
                    ]
                ]
            ];

            if ($startCursor) {
                $body['start_cursor'] = $startCursor;
            }

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            
            if (curl_errno($ch)) {
                throw new Exception('Erreur lors de la requête Notion: ' . curl_error($ch));
            }
            
            curl_close($ch);
            
            $data = json_decode($response, true);
            
            if (isset($data['object']) && $data['object'] === 'error') {
                throw new Exception('Erreur Notion: ' . $data['message']);
            }

            // Ajouter les résultats de cette page
            $allResults = array_merge($allResults, $data['results']);

            // Mettre à jour le curseur pour la prochaine page
            $startCursor = $data['next_cursor'];

        } while ($data['has_more'] && $startCursor);

        // Traiter tous les résultats
        return array_map(function($page) {
            $item = [];
            
            // Traiter tous les champs de la page
            foreach ($page['properties'] as $fieldName => $fieldData) {
                $value = $this->extractFieldValue($fieldData);
                
                // Supprimer les préfixes pour les champs spécifiques
                if (is_array($value)) {
                    $value = array_map(function($v) {
                        return $this->removePrefix($v);
                    }, $value);
                } else {
                    $value = $this->removePrefix($value);
                }
                
                $item[$fieldName] = $value;
            }

            // Ajouter les champs système
            $item['id'] = $page['id'];
            $item['created_at'] = $page['created_time'];

            return $item;
        }, $allResults);
    }

    private function removePrefix($value) {
        if ($value === null) {
            return '';
        }

        $prefixes = [
            'Presta : ' => '',
            'Inst : ' => '',
            'Récup : ' => ''
        ];
        
        return str_replace(array_keys($prefixes), array_values($prefixes), $value);
    }

    private function extractFieldValue($fieldData) {
        $type = $fieldData['type'];
        
        switch ($type) {
            case 'title':
            case 'rich_text':
                $textArray = $fieldData[$type];
                return !empty($textArray) ? $textArray[0]['plain_text'] : '';
                
            case 'select':
                return $fieldData[$type] ? $fieldData[$type]['name'] : '';
                
            case 'multi_select':
                return array_map(function($item) {
                    return $item['name'];
                }, $fieldData[$type]);
                
            case 'date':
                return $fieldData[$type] ? $fieldData[$type]['start'] : '';
                
            case 'number':
                return $fieldData[$type];
                
            case 'checkbox':
                return $fieldData[$type] ? 'Oui' : 'Non';
                
            case 'url':
            case 'email':
            case 'phone_number':
                return $fieldData[$type] ?: '';
                
            case 'files':
                return array_map(function($file) {
                    return $file['name'];
                }, $fieldData[$type]);

            case 'status':
            case 'État':
                return isset($fieldData[$type]['name']) ? $fieldData[$type]['name'] : '';
                
            default:
                return 'Type non supporté: ' . $type;
        }
    }
}