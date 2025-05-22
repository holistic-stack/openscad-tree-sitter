;; Inject comment language for highlighting TODOs, etc.
((comment) @injection.content
 (#set! injection.language "comment"))

;; Inject string language for string literals
((string) @injection.content
 (#set! injection.language "string"))
