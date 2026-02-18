;; StackScope Notes Smart Contract
;; Allows users to add, update, and delete notes linked to transactions
;; Follows Clarity best practices for security and gas efficiency

(impl-trait principal)

;; Constants
(define-constant ERR-NOT-FOUND u401)
(define-constant ERR-UNAUTHORIZED u402)
(define-constant ERR-NOTE-TOO-LONG u403)
(define-constant MAX-NOTE-LENGTH u200)

;; Data structures
(define-map notes
  { principal: (string-ascii 200) }
  { note: (string-utf8 200) }
  { owner: principal }
  { timestamp: uint }
)

;; Helper functions
(define-read-only (get-note (owner principal) (response (string-utf8 200)))
  (begin
    (match (map-get? notes owner)
      note note
      (default (err u401))
    )
  )
)

(define-read-only (get-note-by-id (owner principal) (txid (buff 32)) (response (string-utf8 200)))
  (begin
    (map-get? notes txid)
  )
)

;; Public functions
(define-public (add-note)
  (owner principal)
  (txid (buff 32))
  (note (string-utf8 200))
  (response (response bool uint))
  (begin
    (let ((note-id (buff 32)) (note-owner principal) (note-timestamp uint)))
      (match (map-get? notes txid)
        note-entry
        (begin
          ;; Check if caller is the note owner
          (if (is-eq tx-sender note-owner)
            (begin
              ;; Update existing note
              (map-set notes
                { txid: (buff 32) note-id }
                { note: note }
                { owner: note-owner }
                { timestamp: block-height }
              )
              (ok true)
            )
            (else
              ;; Unauthorized - caller is not the note owner
              (err ERR-UNAUTHORIZED)
            )
          )
        )
        (default
          ;; Note not found
          (err ERR-NOT-FOUND)
        )
      )
    )
  )
)

(define-public (update-note)
  (owner principal)
  (txid (buff 32))
  (note (string-utf8 200))
  (response (response bool uint))
  (begin
    (let ((note-id (buff 32)) (note-owner principal) (note-timestamp uint)))
      (match (map-get? notes txid)
        note-entry
        (begin
          ;; Check if caller is the note owner
          (if (is-eq tx-sender note-owner)
            (begin
              ;; Check note length
              (if (<= (len-bytes note) MAX-NOTE-LENGTH)
                (begin
                  ;; Update existing note
                  (map-set notes
                    { txid: (buff 32) note-id }
                    { note: note }
                    { owner: note-owner }
                    { timestamp: block-height }
                  )
                  (ok true)
                )
                (else
                  ;; Note too long
                  (err ERR-NOTE-TOO-LONG)
                )
              )
            )
            (else
              ;; Unauthorized - caller is not the note owner
              (err ERR-UNAUTHORIZED)
            )
          )
        )
        (default
          ;; Note not found
          (err ERR-NOT-FOUND)
        )
      )
    )
  )
)

(define-public (delete-note)
  (owner principal)
  (txid (buff 32))
  (response (response bool uint))
  (begin
    (let ((note-id (buff 32)) (note-owner principal) (note-timestamp uint)))
      (match (map-get? notes txid)
        note-entry
        (begin
          ;; Check if caller is the note owner
          (if (is-eq tx-sender note-owner)
            (begin
              ;; Delete the note
              (map-delete notes { txid: (buff 32) note-id })
              (ok true)
            )
            (else
              ;; Unauthorized - caller is not the note owner
              (err ERR-UNAUTHORIZED)
            )
          )
        )
        (default
          ;; Note not found
          (err ERR-NOT-FOUND)
        )
      )
    )
  )
)

;; Read-only functions
(define-read-only (get-note)
  (txid (buff 32))
  (response (string-utf8 200))
  (begin
    (match (map-get? notes txid)
      note-entry
      (ok (get note note-entry))
      (err ERR-NOT-FOUND)
    )
  )
)

;; Read-only function to get all notes for an owner
(define-read-only (get-all-notes)
  (owner principal)
  (response (list (string-utf8 200)))
  (begin
    (ok (map-values notes))
  )
)

;; Read-only function to get note count
(define-read-only (get-note-count)
  (owner principal)
  (response (uint))
  (begin
    (ok (len notes))
  )
)
