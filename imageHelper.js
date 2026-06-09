// imageHelper.js
export function validateImageSize(input) {
    if(input.files && input.files[0] && input.files[0].size > 3 * 1024 * 1024) { 
        alert("🚨 ඡායාරූපය විශාල වැඩියි! කරුණාකර 3MB වලට අඩු පින්තූරයක් ලබාදෙන්න."); 
        input.value = "";
        return false;
    }
    return true;
}

export function compressImagePreserveRatio(file, maxSide = 500, quality = 0.5) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader(); 
        reader.readAsDataURL(file);
        reader.onload = event => {
            let img = new Image(); 
            img.src = event.target.result;
            img.onload = () => {
                let canvas = document.createElement('canvas'); 
                let width = img.width, height = img.height;
                if (width > height) { if (width > maxSide) { height *= maxSide / width; width = maxSide; } } 
                else { if (height > maxSide) { width *= maxSide / height; height = maxSide; } }
                canvas.width = width; canvas.height = height;
                let ctx = canvas.getContext('2d'); 
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
        };
        reader.onerror = error => reject(error);
    });
}