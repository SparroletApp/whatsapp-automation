
CREATE TABLE whatsapp_accounts (
                                   id BIGSERIAL PRIMARY KEY,

                                   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                   user_id BIGINT NOT NULL,

                                   waba_id VARCHAR(255) NOT NULL,

                                   phone_number_id VARCHAR(255) NOT NULL,

                                   display_phone_number VARCHAR(50),

                                   verified_name VARCHAR(255),

                                   meta_business_id VARCHAR(255),

                                   meta_user_id VARCHAR(255),

                                   access_token VARCHAR(2000) NOT NULL,

                                   connection_status VARCHAR(30) DEFAULT 'PENDING',

                                   is_active BOOLEAN DEFAULT TRUE,

                                   connected_at TIMESTAMP,

                                   CONSTRAINT uk_whatsapp_phone_number_id
                                       UNIQUE (phone_number_id),

                                   CONSTRAINT chk_whatsapp_connection_status
                                       CHECK (
                                           connection_status IN (
                                                                 'PENDING',
                                                                 'CONNECTED',
                                                                 'DISCONNECTED',
                                                                 'EXPIRED',
                                                                 'FAILED'
                                               )
                                           )
);

CREATE INDEX idx_whatsapp_user_id
    ON whatsapp_accounts(user_id);

CREATE INDEX idx_whatsapp_waba_id
    ON whatsapp_accounts(waba_id);

CREATE INDEX idx_whatsapp_status
    ON whatsapp_accounts(connection_status);
