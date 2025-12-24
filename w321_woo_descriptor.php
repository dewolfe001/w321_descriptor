<?php
/**
 * Plugin Name: WP Image Descriptor
 * Plugin URI:  https://descriptor.web321.co/
 * Description: Describes product images for WooCommerce products, populates media meta, and provides a "Try again" feature for generating new descriptions.
 * Version:     1.5.1
 * Author: dewolfe001
 * Author URI: https://web321.co/
 * Text Domain: woo-descriptor
 * License: GPLv2 or later
*/

defined('ABSPATH') || exit;

// Define plugin constants.
define( 'WD_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WD_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WD_VERSION', '1.0.2' );
define( 'WD_NONCE_ACTION', 'descriptor_action' );
define( 'WD_API_ENDPOINT', 'https://descriptor.web321.co/wp-json/woo-descriptor/v1' );

/**
 * Class WooDescriptor
 */
class WooDescriptor {

    /**
     * Constructor.
     */
    public function __construct() {
        // Admin scripts/styles
        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_assets' ] );

        // Create sub-menu under WooCommerce
        add_action( 'admin_menu', [ $this, 'add_woo_descriptor_submenu' ], 99 );

        // Register settings
        add_action( 'admin_init', [ $this, 'register_plugin_settings' ] );

        // AJAX handlers
        add_action( 'wp_ajax_w321get_descriptions', [ $this, 'ajax_generate_image_descriptions' ] );
        add_action( 'wp_ajax_w321_bulk_descriptions', [ $this, 'ajax_generate_bulk_image_descriptions' ] );
    }

    /**
     * Enqueue admin scripts and styles.
     */
    public function admin_enqueue_assets( $hook ) {
        // Only enqueue on relevant pages (e.g. upload.php, post.php, post-new.php, product edit, or your settings page).
        // Adjust the condition as needed for your environment.
        if ( 'upload.php' === $hook || 'post.php' === $hook || 'post-new.php' === $hook || $this->is_woo_descriptor_settings_page( $hook ) ) {

            wp_enqueue_style(
                'woo-descriptor-admin-css',
                WD_PLUGIN_URL . 'assets/css/woo-descriptor-admin.css',
                [],
                WD_VERSION
            );

            // Enqueue your custom script
            wp_enqueue_script(
                'woo-descriptor-admin-js',
                WD_PLUGIN_URL . 'assets/js/woo-descriptor-admin.js', // Youll create this JS file
                [ 'jquery' ],
                WD_VERSION,
                true
            );

            $account_key = get_option( 'wd_account_key', '' );
            $account_status = 1;
            if ( empty( $account_key ) ) {
                $account_status = -1;                                
            }

            $nonce = wp_create_nonce(WD_NONCE_ACTION);
            wp_localize_script('woo-descriptor-admin-js', 'w321descritptor', [
                'ajax_url' => admin_url('admin-ajax.php'),
                'account_status' => $account_status, 
                'descriptor_nonce'    => $nonce
            ]);
            
        }
    }

    /**
     * Check if the current page is the plugin settings page.
     */
    private function is_woo_descriptor_settings_page( $hook ) {
        // Adjust this based on your submenu slug
        return ( 'woocommerce_page_woo-descriptor-settings' === $hook );
    }

    /**
     * Add a submenu under the WooCommerce menu for "Woo Descriptor" settings.
     */
    public function add_woo_descriptor_submenu() {
        add_submenu_page(
            'woocommerce',                            // Parent slug (WooCommerce)
            __( 'WP Image Descriptor', 'woo-descriptor' ), // Page Title
            __( 'WP Descriptor', 'woo-descriptor' ), // Menu Title
            'manage_woocommerce',                     // Capability (adjust as needed)
            'woo-descriptor-settings',                // Menu slug
            [ $this, 'render_settings_page' ]         // Callback function
        );
                
        add_submenu_page(
            'upload.php',                                   // Parent slug (Media)
            __( 'WP Image Descriptor', 'woo-descriptor' ), // Page Title
            __( 'WP Descriptor', 'woo-descriptor' ),       // Menu Title
            'upload_files',                               // Capability (adjust as needed)
            'woo-descriptor-settings',                     // Menu slug
            [ $this, 'render_settings_page' ]              // Callback function
        );        
        
    }

    /**
     * Register plugin settings (called in admin_init).
     */
    public function register_plugin_settings() {
        // Register a setting to store the supplemental information
        register_setting(
            'woo_descriptor_settings_group',    // settings group
            'wd_supplemental_information',      // option name
            [ 'sanitize_callback' => 'sanitize_text_field' ]
        );

        // Possibly register an option for storing the account key or account information
        register_setting(
            'woo_descriptor_settings_group',
            'wd_account_key',
            [ 'sanitize_callback' => 'sanitize_text_field' ]
        );
    }

    /**
     * Render the settings page.
     */
    public function render_settings_page() {
        // Check user capabilities, etc.
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'WP Image Descriptor Settings', 'woo-descriptor' ); ?></h1>
            <form method="post" action="options.php">
                <?php settings_fields( 'woo_descriptor_settings_group' ); ?>
                <?php do_settings_sections( 'woo_descriptor_settings_group' ); ?>

                <h2><?php esc_html_e( 'Account', 'woo-descriptor' ); ?></h2>
                <?php
                $account_key = get_option( 'wd_account_key', '' );
                // Example: If not registered, show an iframe, otherwise show their account standing.
                if ( empty( $account_key ) ) :
                    ?>
                    <p><?php esc_html_e( 'You are not registered. Please register below:', 'woo-descriptor' ); ?></p>
                    <iframe
                        src="https://descriptor.web321.co/dashboard"
                        style="width: 100%; height: 600px;"
                        frameborder="0"
                    ></iframe>
                <?php else : ?>
                    <p><?php esc_html_e( 'Your account is linked. Account Key:', 'woo-descriptor' ); ?> <strong><?php echo esc_html( $account_key ); ?></strong></p>
                    <p><a href="https://descriptor.web321.co/dashboard/" target="_new" class="description_button">Check Descriptor to see your account status.</a></p>
                <?php endif; ?>

                <table class="form-table">
                    <tbody>
                        <tr>
                            <th scope="row"><?php esc_html_e( 'Account Key', 'woo-descriptor' ); ?></th>
                            <td>
                                <input type="text" name="wd_account_key" value="<?php echo esc_attr( $account_key ); ?>" class="regular-text" />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <hr>

                <h2><?php esc_html_e( 'Settings', 'woo-descriptor' ); ?></h2>
                <table class="form-table">
                    <tbody>
                        <tr>
                            <th scope="row">
                                <label for="wd_supplemental_information"><?php esc_html_e( 'Supplemental Information', 'woo-descriptor' ); ?></label>
                            </th>
                            <td>
                                <?php $supplemental_info = get_option( 'wd_supplemental_information', '' ); ?>
                                <textarea
                                    name="wd_supplemental_information"
                                    id="wd_supplemental_information"
                                    rows="5"
                                    cols="50"
                                ><?php echo esc_textarea( $supplemental_info ); ?></textarea>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <?php submit_button( __( 'Save Settings', 'woo-descriptor' ) ); ?>
            </form>
        </div>
        <style>
            a.description_button {
                margin-top: 1px;
                margin-left: 1px;
                border: 1px solid rgb(34, 113, 177);
                border-radius: 4px;
                box-shadow: 1px 1px 6px rgba(45, 45, 45, 0.5);
                padding: 12px 8px 12px 8px;
                color: rgb(34, 113, 177);
                background-color: #ededed;
                text-decoration: none;
                transition: 0.2s all;
                display: block;
                width: fit-content;
                font-weight: bold;
            }
            a.description_button:hover {
                margin-top: 3px;
                margin-left: 2px;
                border: 1px solid #222;
                border-radius: 4px;
                box-shadow: 1px 1px 3px rgba(35, 35, 35, 0.6);
                color: #444;
                background-color: #f9f9f6;                
            }            
            
        </style>
        <?php
    }

    /**
     * AJAX handler: Generate all descriptions (alt text, title, caption, description).
     */
    public function ajax_generate_image_descriptions() {
        // Security check
        check_ajax_referer( WD_NONCE_ACTION, 'nonce' );

        // Capability check (optional; recommended)
        if ( ! current_user_can( 'upload_files' ) ) {
            wp_send_json_error( [ 'message' => __( 'You do not have permission to upload files.', 'woo-descriptor' ) ] );
        }
        
        $attachment = ! empty( $_POST['attachment'] ) ? $_POST['attachment'] : false;
        if ( ! $attachment ) {
            wp_send_json_error( [ 'message' => __( 'Invalid attachment.', 'woo-descriptor' ) ] );
        }
        $fields = isset( $_POST['fields'] ) ? (array) $_POST['fields'] : [ 'alt', 'title', 'caption', 'description' ];
        $context = isset( $_POST['context'] ) ? sanitize_textarea_field( wp_unslash( $_POST['context'] ) ) : '';

        $api_result = $this->fetch_descriptions_for_attachment( (int) $attachment, $fields, $context );

        if ( is_wp_error( $api_result ) ) {
            wp_send_json_error(
                [ 'error' => $api_result->get_error_message() ],
                500
            );
        }

        if ( empty( $api_result ) || ! is_array( $api_result ) ) {
            wp_send_json_error( [ 'error' => 'Missing description field' ], 500 );
        }

        // Send response back to the client
        wp_send_json_success( $api_result );
    }

    /**
     * AJAX handler: Generate descriptions in bulk and persist them to attachments.
     */
    public function ajax_generate_bulk_image_descriptions() {
        check_ajax_referer( WD_NONCE_ACTION, 'nonce' );

        if ( ! current_user_can( 'upload_files' ) ) {
            wp_send_json_error( [ 'message' => __( 'You do not have permission to upload files.', 'woo-descriptor' ) ] );
        }

        $attachments = isset( $_POST['attachments'] ) ? (array) $_POST['attachments'] : [];
        $attachments = array_values( array_filter( array_map( 'intval', $attachments ) ) );

        if ( empty( $attachments ) ) {
            wp_send_json_error( [ 'message' => __( 'No attachments selected.', 'woo-descriptor' ) ] );
        }

        $fields = isset( $_POST['fields'] ) ? (array) $_POST['fields'] : [ 'alt', 'title', 'caption', 'description' ];

        $results = [
            'updated' => [],
            'errors' => [],
        ];

        foreach ( $attachments as $attachment_id ) {
            $api_result = $this->fetch_descriptions_for_attachment( $attachment_id, $fields );

            if ( is_wp_error( $api_result ) ) {
                $results['errors'][ $attachment_id ] = $api_result->get_error_message();
                continue;
            }

            $this->update_attachment_from_descriptions( $attachment_id, $api_result, $fields );
            $results['updated'][] = $attachment_id;
        }

        wp_send_json_success( $results );
    }

    /**
     * Fetch descriptions for a given attachment ID.
     */
    private function fetch_descriptions_for_attachment( int $attachment_id, array $fields, string $context = '' ) {
        $image_url = wp_get_attachment_url( $attachment_id );
        if ( ! $image_url ) {
            return new WP_Error( 'invalid_attachment', __( 'Invalid attachment.', 'woo-descriptor' ) );
        }

        // Gather needed info
        $supplemental_info = get_option( 'wd_supplemental_information', '' );
        if ( ! empty( $context ) ) {
            $supplemental_info = trim( $supplemental_info . "\n\n" . $context );
        }
        $private_key = get_option( 'wd_account_key', '' );

        $generator = new TimeBasedKeyGenerator( $private_key );
        $key = $generator->generateKey( $fields );

        $response = wp_remote_post(
            WD_API_ENDPOINT . '/describe',
            [
                'body' => [
                    'image_url' => $image_url,
                    'key' => $key['key'],
                    'fields' => $fields,
                    'supplemental_info' => $supplemental_info,
                ],
                'timeout' => 60,
            ]
        );

        if ( is_wp_error( $response ) ) {
            return new WP_Error( 'descriptor_api_error', $response->get_error_message() );
        }

        $response_body = wp_remote_retrieve_body( $response );
        if ( '{"error":"Invalid or expired key."}' === $response_body ) {
            return new WP_Error( 'descriptor_invalid_key', __( 'Invalid access key.', 'woo-descriptor' ) );
        }

        $api_result = descriptor_process_api_response( $response_body );

        if ( is_wp_error( $api_result ) ) {
            return $api_result;
        }

        if ( empty( $api_result ) || ! is_array( $api_result ) ) {
            return new WP_Error( 'descriptor_missing_description', __( 'Missing description field', 'woo-descriptor' ) );
        }

        return $api_result;
    }

    /**
     * Update attachment fields from description data.
     */
    private function update_attachment_from_descriptions( int $attachment_id, array $descriptions, array $fields ) {
        if ( in_array( 'alt', $fields, true ) && isset( $descriptions['alt'] ) ) {
            update_post_meta( $attachment_id, '_wp_attachment_image_alt', $descriptions['alt'] );
        }

        $post_updates = [
            'ID' => $attachment_id,
        ];

        if ( in_array( 'title', $fields, true ) && isset( $descriptions['title'] ) ) {
            $post_updates['post_title'] = $descriptions['title'];
        }

        if ( in_array( 'caption', $fields, true ) && isset( $descriptions['caption'] ) ) {
            $post_updates['post_excerpt'] = $descriptions['caption'];
        }

        if ( in_array( 'description', $fields, true ) && isset( $descriptions['description'] ) ) {
            $post_updates['post_content'] = $descriptions['description'];
        }

        if ( count( $post_updates ) > 1 ) {
            wp_update_post( $post_updates );
        }
    }
    

} // End of class WooDescriptor

// Instantiate the plugin.
new WooDescriptor();

class TimeBasedKeyGenerator {
    private $secret_key;
    private $validity_hours = 48;
    
    public function __construct(string $secret_key) {
        $this->secret_key = $secret_key;
    }
    
    public function normalizeTime($nowish) {
        $start_of_year = strtotime('first day of January ' . date('Y')); 
        if (intval($nowish) == $nowish) {
            $current_time = $nowish;        
        }
        else {
            $current_time = strtotime($nowish);
        }
        $seconds_since_start_of_year = $current_time - $start_of_year; 
        
        // Define the bucket size (e.g., 12 hours)
        $bucket_size = $this->validity_hours * 60 * 60; // 12 hours = 43200 seconds
        
        // Normalize the value by dividing and flooring
        $normalized_value = floor(($seconds_since_start_of_year - ($bucket_size / 2) ) / $bucket_size);
        return $normalized_value;
    }
    
    /**
     * Generate a secure time-based key
     * @param array $fields Additional fields to include in key generation
     * @return array Contains the key and expiration timestamp
     */
    public function generateKey(array $fields = []): array {
        // Get current timestamp and round to nearest hour
        $current_time = time() + 30; // some breating room for travel time
        $normalized = $this->normalizeTime($current_time);        

        // Create base string with fields and timestamp
        $base_string = implode('_', $fields);
        
        error_log("generate ".$this->secret_key." - ".$base_string ." - ". $normalized);
        $key = md5($this->secret_key . $base_string . $normalized);
        
        return [
            'key' => $key,
            'expires_at' => $current_time + (($this->validity_hours / 2) * 3600)
        ];
    }
    
    /**
     * Verify if a key is valid
     * @param string $key The key to verify
     * @param array $fields The fields used to generate the key
     * @return bool Whether the key is valid
     */
    public function verifyKey(string $provided_key, array $fields = []): bool {
        // Check current and previous hour's keys
        $current_time = time();
        
        // Check keys for the past 48 hours
        for ($i = 0; $i < $this->validity_hours; $i++) {
            $check_time = $current_time - ($i * 3600);
            $hourly_timestamp = floor($check_time / 3600) * 3600;
            
            $base_string = implode('_', $fields);
            $check_key = hash_hmac(
                'sha256',
                $base_string . $hourly_timestamp,
                $this->secret_key
            );
            
            if (hash_equals($check_key, $provided_key)) {
                return true;
            }
        }
        
        return false;
    }
}


/**
 * Extract nested JSON from API response
 * 
 * @param string $api_response The raw API response containing nested JSON
 * @return array|WP_Error Returns parsed JSON array or WP_Error on failure
 */
function descriptor_extract_nested_json_wp($api_response) {
    // First, decode the outer JSON
    $outer_json = json_decode($api_response, true);
    
    // Check if json_decode failed
    if (json_last_error() !== JSON_ERROR_NONE) {
        return new WP_Error(
            'json_decode_error',
            'Failed to decode outer JSON: ' . json_last_error_msg()
        );
    }
    
    // Extract JSON between ```json and ``` markers
    if (!isset($outer_json['description'])) {
        return new WP_Error(
            'missing_description',
            'No description field found in API response'
        );
    }
    
    // Use regex to extract the JSON content
    if (!preg_match('/```json\n(.*?)\n```/s', $outer_json['description'], $matches)) {
        return new WP_Error(
            'no_json_found',
            'No JSON found in markdown code blocks'
        );
    }
    
    // Parse the extracted JSON
    $inner_json = json_decode($matches[1], true);
    
    // Check if second json_decode failed
    if (json_last_error() !== JSON_ERROR_NONE) {
        return new WP_Error(
            'inner_json_error',
            'Failed to decode inner JSON: ' . json_last_error_msg()
        );
    }
    
    return $inner_json;
}

/**
 * Example usage in WordPress theme or plugin
 */
function descriptor_process_api_response($api_response) {
    $result = descriptor_extract_nested_json_wp($api_response);

    error_log('JSON result: ' . print_r($api_response, TRUE));    
    if (is_wp_error($result)) {
        // Handle error
        error_log('JSON extraction failed: ' . $result->get_error_message());
        return $result;
    }
    
    // Use the extracted data
    $title = sanitize_text_field($result['title']);
    $alt = sanitize_text_field($result['alt']);
    $caption = wp_kses_post($result['caption']);
    $description = wp_kses_post($result['description']);
    
    return [
        'title' => $title,
        'alt' => $alt,
        'caption' => $caption,
        'description' => $description
    ];
}

// Generate a key
/*
$fields = ['user_id' => 123, 'action' => 'download'];
$result = $generator->generateKey($fields);
$key = $result['key'];
$expires_at = $result['expires_at'];

// Later, verify the key
$is_valid = $generator->verifyKey($key, $fields);
*/
