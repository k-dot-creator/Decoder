document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const decodeForm = document.getElementById('decodeForm');
    const encodedInput = document.getElementById('encodedInput');
    const decodeMethod = document.getElementById('decodeMethod');
    const encodingType = document.getElementById('encodingType');
    const caesarKey = document.getElementById('caesarKey');
    const caesarKeyContainer = document.querySelector('.caesar-key-container');
    const decodeBtn = document.getElementById('decodeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const alertArea = document.getElementById('alertArea');
    const textOutput = document.getElementById('textOutput');
    const decodedText = document.getElementById('decodedText');
    const imageOutput = document.getElementById('imageOutput');
    const decodedImage = document.getElementById('decodedImage');
    const fileOutput = document.getElementById('fileOutput');
    const fileInfo = document.getElementById('fileInfo');
    
    // Show/hide Caesar key input based on selected method
    decodeMethod.addEventListener('change', function() {
        if (this.value === 'caesar') {
            caesarKeyContainer.classList.remove('d-none');
        } else {
            caesarKeyContainer.classList.add('d-none');
        }
    });
    
    // Store the decoded binary data for downloading
    let decodedData = null;
    let decodedFilename = 'decoded_file';

    // Handle form submission
    decodeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous results
        clearOutput();
        
        // Validate input
        const input = encodedInput.value.trim();
        if (!input) {
            showAlert('Please enter encoded data', 'danger');
            return;
        }
        
        // Disable the decode button and show loading state
        decodeBtn.disabled = true;
        decodeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Decoding...';
        
        try {
            // Process the decode request based on selected method
            const method = decodeMethod.value;
            let result;
            
            switch(method) {
                case 'base64':
                    result = base64Decode(input);
                    showTextResult(result);
                    break;
                    
                case 'hex':
                    result = hexDecode(input);
                    showTextResult(result);
                    break;
                    
                case 'binary':
                    result = binaryDecode(input);
                    showTextResult(result);
                    break;
                    
                case 'url':
                    result = urlDecode(input);
                    showTextResult(result);
                    break;
                    
                case 'html':
                    result = htmlDecode(input);
                    showTextResult(result);
                    break;
                    
                case 'rot13':
                    result = rot13Decode(input);
                    showTextResult(result);
                    break;
                    
                case 'caesar':
                    const key = parseInt(caesarKey.value);
                    if (isNaN(key) || key < 1 || key > 25) {
                        showAlert('Caesar cipher key must be between 1 and 25', 'danger');
                        return;
                    }
                    result = caesarDecode(input, key);
                    showTextResult(result);
                    break;
                    
                case 'morse':
                    result = morseDecode(input);
                    showTextResult(result);
                    break;
                    
                default:
                    // Default to base64
                    result = base64Decode(input);
                    showTextResult(result);
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Failed to decode: ' + error.message, 'danger');
        } finally {
            // Re-enable the decode button
            decodeBtn.disabled = false;
            decodeBtn.innerHTML = '<i class="fas fa-unlock me-1"></i>Decode';
        }
    });
    
    // Base64 decoding function (client-side only)
    function base64Decode(input) {
        // Handle padding if needed
        const padding_needed = input.length % 4;
        if (padding_needed) {
            input += "=".repeat(4 - padding_needed);
        }
        
        try {
            // For text-based Base64 decoding
            const binary = atob(input);
            let bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            
            // Try to decode as text with the specified encoding
            const decoder = new TextDecoder(encodingType.value);
            return decoder.decode(bytes);
        } catch (e) {
            if (e.name === 'InvalidCharacterError') {
                throw new Error('Invalid Base64 characters');
            } else {
                throw e;
            }
        }
    }
    
    // Function to check if a string might be an image in Base64
    function tryDisplayBase64Image(input) {
        try {
            // Handle padding if needed
            const padding_needed = input.length % 4;
            if (padding_needed) {
                input += "=".repeat(4 - padding_needed);
            }
            
            decodedData = input;
            decodedImage.src = `data:image/png;base64,${input}`;
            decodedImage.onload = function() {
                // It loaded as an image
                imageOutput.classList.remove('d-none');
                showAlert('Successfully decoded to image!', 'success');
                downloadBtn.disabled = false;
            };
            decodedImage.onerror = function() {
                // Not an image, just show as text
                decodedImage.src = '';
            };
        } catch (e) {
            // Ignore errors when trying to display as image
            decodedImage.src = '';
        }
    }
    
    // Decode functions for various encoding types
    function hexDecode(input) {
        // Remove any spaces or non-hex characters
        input = input.replace(/[^0-9A-Fa-f]/g, '');
        
        if (input.length % 2 !== 0) {
            throw new Error('Invalid hexadecimal string (must have even length)');
        }
        
        let result = '';
        for (let i = 0; i < input.length; i += 2) {
            const byte = parseInt(input.substr(i, 2), 16);
            result += String.fromCharCode(byte);
        }
        
        // Try to convert to specified encoding
        try {
            const encoding = encodingType.value;
            if (encoding !== 'utf-8') {
                // This is a simplification - proper encoding conversion requires more complex logic
                return result;
            }
            return result;
        } catch (e) {
            return result;
        }
    }
    
    function binaryDecode(input) {
        // Remove spaces and validate binary input
        input = input.replace(/\s+/g, '');
        
        if (!/^[01]+$/.test(input)) {
            throw new Error('Invalid binary string (must contain only 0s and 1s)');
        }
        
        // Ensure the binary string is a multiple of 8 bits
        if (input.length % 8 !== 0) {
            throw new Error('Invalid binary string (must be a multiple of 8 bits)');
        }
        
        let result = '';
        for (let i = 0; i < input.length; i += 8) {
            const byte = parseInt(input.substr(i, 8), 2);
            result += String.fromCharCode(byte);
        }
        
        return result;
    }
    
    function urlDecode(input) {
        return decodeURIComponent(input);
    }
    
    function htmlDecode(input) {
        const doc = new DOMParser().parseFromString(input, 'text/html');
        return doc.documentElement.textContent;
    }
    
    function rot13Decode(input) {
        return input.replace(/[a-zA-Z]/g, function(c) {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) { // Uppercase
                return String.fromCharCode(((code - 65 + 13) % 26) + 65);
            } else if (code >= 97 && code <= 122) { // Lowercase
                return String.fromCharCode(((code - 97 + 13) % 26) + 97);
            }
            return c;
        });
    }
    
    function caesarDecode(input, shift) {
        return input.replace(/[a-zA-Z]/g, function(c) {
            const code = c.charCodeAt(0);
            if (code >= 65 && code <= 90) { // Uppercase
                return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
            } else if (code >= 97 && code <= 122) { // Lowercase
                return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
            }
            return c;
        });
    }
    
    const MORSE_CODE = {
        '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
        '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
        '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
        '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
        '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
        '--..': 'Z', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
        '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
        '-----': '0', '--..--': ',', '.-.-.-': '.', '..--..': '?',
        '-..-.': '/', '-.--.': '(', '-.--.-': ')', '.-...': '&',
        '---...': ':', '-.-.-.': ';', '-...-': '=', '.-.-.': '+',
        '-....-': '-', '..--.-': '_', '.-..-.': '"', '...-..-': '$',
        '.--.-.': '@', '/': ' '
    };
    
    function morseDecode(input) {
        // Parse the input as morse code
        // Normalize the separators: single space for letter separation, and forward slash or multiple spaces for word separation
        input = input.trim().replace(/\s+/g, ' ').replace(/\s*\/\s*/g, ' / ');
        
        const words = input.split(' / ');
        let result = '';
        
        for (const word of words) {
            const letters = word.split(' ');
            for (const letter of letters) {
                if (!letter) continue;
                
                const decoded = MORSE_CODE[letter];
                if (decoded) {
                    result += decoded;
                } else {
                    throw new Error(`Unknown morse code symbol: ${letter}`);
                }
            }
            result += ' ';
        }
        
        return result.trim();
    }
    
    // Display the decoded text result
    function showTextResult(text) {
        textOutput.classList.remove('d-none');
        decodedText.value = text;
        copyBtn.disabled = false;
        
        // Check if Base64 might be an image
        if (decodeMethod.value === 'base64') {
            tryDisplayBase64Image(encodedInput.value.trim());
        }
        
        showAlert('Successfully decoded!', 'success');
    }
    
    // Display result as a generic file
    function displayAsFile(byteLength) {
        fileOutput.classList.remove('d-none');
        
        // Format file size
        let sizeDisplay = byteLength + ' bytes';
        if (byteLength > 1024 * 1024) {
            sizeDisplay = (byteLength / (1024 * 1024)).toFixed(2) + ' MB';
        } else if (byteLength > 1024) {
            sizeDisplay = (byteLength / 1024).toFixed(2) + ' KB';
        }
        
        fileInfo.textContent = `Binary file (${sizeDisplay})`;
        showAlert('Successfully decoded to binary file!', 'success');
    }

    // Clear output display
    function clearOutput() {
        alertArea.innerHTML = '';
        textOutput.classList.add('d-none');
        imageOutput.classList.add('d-none');
        fileOutput.classList.add('d-none');
        decodedText.value = '';
        decodedImage.src = '';
        copyBtn.disabled = true;
        downloadBtn.disabled = true;
        decodedData = null;
    }

    // Display alert message
    function showAlert(message, type) {
        alertArea.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    // Clear button event
    clearBtn.addEventListener('click', function() {
        encodedInput.value = '';
        clearOutput();
    });

    // Copy button event
    copyBtn.addEventListener('click', function() {
        if (decodedText.value) {
            decodedText.select();
            document.execCommand('copy');
            
            // Show success message
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }
    });

    // Download button event
    downloadBtn.addEventListener('click', function() {
        if (decodedData) {
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = `data:application/octet-stream;base64,${decodedData}`;
            link.download = decodedFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

    // Detect base64 input and auto-populate
    encodedInput.addEventListener('paste', function(e) {
        // Give the browser time to paste the content
        setTimeout(() => {
            if (encodedInput.value.length > 0) {
                // Detect common Base64 patterns (optional)
                const input = encodedInput.value.trim();
                
                // Quick check if input might be a data URL
                if (input.startsWith('data:')) {
                    const match = input.match(/^data:([^;]+);base64,(.+)$/);
                    if (match && match[2]) {
                        // Extract just the Base64 part
                        encodedInput.value = match[2];
                        
                        // Try to determine file type and set name
                        const mimeType = match[1];
                        if (mimeType.startsWith('image/')) {
                            const ext = mimeType.split('/')[1];
                            decodedFilename = `decoded_image.${ext}`;
                        } else {
                            // Set filename based on mime type if possible
                            const ext = mimeType.split('/')[1];
                            if (ext) {
                                decodedFilename = `decoded_file.${ext}`;
                            }
                        }
                        
                        // Auto-select Base64 decoding method
                        decodeMethod.value = 'base64';
                        // Hide Caesar key field if it was previously shown
                        caesarKeyContainer.classList.add('d-none');
                    }
                }
            }
        }, 0);
    });
});