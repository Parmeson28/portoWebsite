// Inline equipment listing editor. Persistence is limited to this browser.
(function initProductListingEditor() {
    const editor = document.getElementById('productListingEditor');
    if (!editor) return;

    const byId = id => document.getElementById(id);
    const sidebar = byId('sidebar');
    const backdrop = byId('backdrop');
    document.querySelector('.hamburger')?.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('open');
    });
    backdrop?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
    });
    const form = byId('productForm');
    const fields = {
        name: byId('productName'), description: byId('productDescription'),
        price: byId('productPrice'), available: byId('productAvailability'),
        whatsapp: byId('productWhatsapp')
    };
    // Keep drafts created by the previous preview screen readable.
    const storageKey = 'portoMaquinas.productDraft.v1';
    const maxImages = 8;
    const maxFileSize = 2 * 1024 * 1024;
    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const imageInput = byId('productImages');
    const imageUrl = byId('productImageUrl');
    const imageList = byId('productImageList');
    const thumbnails = byId('productImageThumbnails');
    const previewImage = byId('previewImage');
    const imageEmpty = byId('previewImageEmpty');
    const imageCounter = byId('previewImageCounter');
    const previousImage = byId('previousProductImage');
    const nextImage = byId('nextProductImage');
    const specFields = byId('productSpecFields');
    const addSpecButton = byId('addProductSpec');
    const saveMessage = byId('productSaveMessage');
    const imageMessage = byId('imageMessage');
    const saveButton = byId('saveProductDraft');
    const addImageButton = byId('addProductImage');
    const failedImageSources = new Set();
    let images = [];
    let currentImage = 0;
    let specSequence = 0;
    let dirty = false;
    let readingImages = false;

    function setMessage(element, text, error = false) {
        element.textContent = text;
        element.hidden = !text;
        element.classList.toggle('product-message-error', error);
    }

    function markDirty() {
        dirty = true;
        setMessage(saveMessage, 'Você tem alterações ainda não salvas neste navegador.');
    }

    function isImageSource(source, allowData = false) {
        if (typeof source !== 'string') return false;
        if (allowData && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(source)) {
            return source.length <= Math.ceil(maxFileSize * 4 / 3) + 100;
        }
        if (source.length > 2048) return false;
        try {
            const url = new URL(source);
            return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
        } catch {
            return false;
        }
    }

    function readProduct() {
        return {
            name: fields.name.value.trim(), description: fields.description.value.trim(),
            price: fields.price.value, available: fields.available.value === 'true',
            whatsapp: fields.whatsapp.value.trim(), images,
            specifications: Array.from(specFields.querySelectorAll('.product-spec-row'), row => ({
                label: row.querySelector('.product-spec-key').value.trim(),
                value: row.querySelector('.product-spec-value').value.trim()
            }))
        };
    }

    function showImage() {
        const image = images[currentImage];
        const failed = image && failedImageSources.has(image.src);
        previewImage.hidden = !image || Boolean(failed);
        imageEmpty.hidden = Boolean(image) && !failed;
        byId('previewImageEmptyText').textContent = failed
            ? 'Não foi possível carregar esta foto. Confira o endereço ou escolha outra imagem.'
            : 'Adicione fotos para apresentar o equipamento.';
        if (image) {
            previewImage.alt = `${fields.name.value.trim() || 'Equipamento'} — foto ${currentImage + 1}`;
            if (previewImage.getAttribute('src') !== image.src) previewImage.src = image.src;
        } else {
            previewImage.removeAttribute('src');
            previewImage.alt = '';
        }
        imageCounter.textContent = image ? `Foto ${currentImage + 1} de ${images.length}` : '';
        imageCounter.hidden = !image;
        previousImage.hidden = images.length < 2;
        nextImage.hidden = images.length < 2;
        thumbnails.hidden = !images.length;
        byId('productImageCount').textContent = `${images.length} de ${maxImages} fotos`;
        thumbnails.querySelectorAll('button').forEach((button, index) => {
            button.classList.toggle('is-selected', index === currentImage);
            button.setAttribute('aria-pressed', String(index === currentImage));
        });
    }

    function updateContact() {
        const product = readProduct();
        const price = Number(product.price);
        const hasPrice = product.price !== '' && Number.isFinite(price) && price >= 0 && price <= 999999999.99;
        const phone = product.whatsapp.replace(/[\s()+.-]/g, '');
        const hasPhone = /^[1-9]\d{9,14}$/.test(phone);
        fields.whatsapp.setCustomValidity(product.whatsapp && !hasPhone
            ? 'Informe o DDI, DDD e número, com 10 a 15 dígitos.' : '');
        fields.available.classList.toggle('is-unavailable', !product.available);
        const whatsapp = byId('previewWhatsapp');
        whatsapp.classList.toggle('is-disabled', !hasPhone);
        whatsapp.setAttribute('aria-disabled', String(!hasPhone));
        whatsapp.tabIndex = hasPhone ? 0 : -1;
        byId('previewWhatsappText').textContent = product.available ? 'Tenho interesse' : 'Consultar disponibilidade';
        byId('previewWhatsappHelp').textContent = hasPhone
            ? 'Teste o contato: o botão abre uma conversa no WhatsApp.'
            : 'Adicione um número de WhatsApp válido para ativar o contato.';
        if (hasPhone) {
            const itemName = product.name || 'este equipamento';
            const message = product.available
                ? `Olá! Tenho interesse no equipamento ${itemName}${hasPrice ? ` (${currency.format(price)})` : ''}. Poderia me passar mais informações?`
                : `Olá! Gostaria de consultar a disponibilidade do equipamento ${itemName}.`;
            whatsapp.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        } else {
            whatsapp.removeAttribute('href');
        }
    }

    function renderImages() {
        imageList.replaceChildren();
        thumbnails.replaceChildren();
        images.forEach((image, index) => {
            const row = document.createElement('li');
            const photo = document.createElement('img');
            photo.src = image.src;
            photo.alt = '';
            photo.className = 'product-upload-thumbnail';
            photo.addEventListener('error', () => { photo.hidden = true; }, { once: true });
            const name = document.createElement('span');
            name.className = 'product-upload-name';
            name.textContent = `${index === 0 ? 'Capa · ' : ''}${image.label}`;
            name.title = image.label;
            const actions = document.createElement('div');
            actions.className = 'product-image-actions';
            if (index > 0) {
                const cover = document.createElement('button');
                cover.type = 'button';
                cover.className = 'product-cover-button';
                cover.textContent = 'Usar como capa';
                cover.setAttribute('aria-label', `Usar foto ${index + 1} como capa`);
                cover.addEventListener('click', () => {
                    images.unshift(images.splice(index, 1)[0]);
                    currentImage = 0;
                    renderImages();
                    markDirty();
                    imageList.querySelector('.product-icon-button').focus();
                });
                actions.append(cover);
            }
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'product-icon-button';
            remove.textContent = '×';
            remove.setAttribute('aria-label', `Remover foto ${index + 1}`);
            remove.addEventListener('click', () => {
                images.splice(index, 1);
                if (!images.some(photo => photo.src === image.src)) failedImageSources.delete(image.src);
                if (index < currentImage) currentImage--;
                currentImage = Math.max(0, Math.min(currentImage, images.length - 1));
                renderImages();
                markDirty();
                const remaining = imageList.querySelectorAll('.product-icon-button');
                (remaining[Math.min(index, remaining.length - 1)] || imageInput).focus();
            });
            actions.append(remove);
            row.append(photo, name, actions);
            imageList.append(row);

            const thumbnail = document.createElement('button');
            thumbnail.type = 'button';
            thumbnail.setAttribute('aria-label', `Ver foto ${index + 1}${index === 0 ? ', capa' : ''}`);
            const thumbnailImage = document.createElement('img');
            thumbnailImage.src = image.src;
            thumbnailImage.alt = '';
            thumbnailImage.addEventListener('error', () => {
                thumbnailImage.hidden = true;
                thumbnail.textContent = String(index + 1);
            }, { once: true });
            thumbnail.append(thumbnailImage);
            thumbnail.addEventListener('click', () => {
                currentImage = index;
                showImage();
            });
            thumbnails.append(thumbnail);
        });
        showImage();
    }

    function addSpecification(spec = { label: '', value: '' }, focus = false) {
        if (specFields.children.length >= 20) return;
        const row = byId('productSpecTemplate').content.firstElementChild.cloneNode(true);
        const key = row.querySelector('.product-spec-key');
        const value = row.querySelector('.product-spec-value');
        const sequence = ++specSequence;
        key.id = `productSpecKey${sequence}`;
        value.id = `productSpecValue${sequence}`;
        row.querySelector('.product-spec-label').htmlFor = key.id;
        row.querySelector('.product-spec-value-label').htmlFor = value.id;
        key.value = spec.label;
        value.value = spec.value;
        row.querySelector('.product-spec-remove').addEventListener('click', () => {
            row.remove();
            addSpecButton.disabled = false;
            markDirty();
            addSpecButton.focus();
        });
        specFields.append(row);
        addSpecButton.disabled = specFields.children.length >= 20;
        if (focus) {
            key.focus();
            markDirty();
        }
    }

    addImageButton.addEventListener('click', () => {
        if (images.length >= maxImages) {
            setMessage(imageMessage, 'Você pode adicionar até 8 fotos. Remova uma para adicionar outra.', true);
            return;
        }
        const source = imageUrl.value.trim();
        if (!isImageSource(source)) {
            setMessage(imageMessage, 'Informe um endereço de imagem começando com https:// ou http://, sem usuário ou senha.', true);
            imageUrl.focus();
            return;
        }
        failedImageSources.delete(source);
        images.push({ src: source, label: `Foto ${images.length + 1}` });
        currentImage = images.length - 1;
        imageUrl.value = '';
        setMessage(imageMessage, 'Endereço adicionado ao rascunho. Confira a foto no carrossel.');
        renderImages();
        markDirty();
    });
    imageUrl.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addImageButton.click();
        }
    });

    imageInput.addEventListener('change', async () => {
        const files = Array.from(imageInput.files || []);
        if (!files.length) return;
        readingImages = true;
        imageInput.disabled = true;
        addImageButton.disabled = true;
        saveButton.disabled = true;
        setMessage(imageMessage, 'Lendo fotos para o rascunho…');
        const errors = [];
        let added = 0;
        try {
            for (const file of files) {
                if (images.length >= maxImages) {
                    errors.push('Limite de 8 fotos atingido.');
                    break;
                }
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > maxFileSize) {
                    errors.push(`${file.name}: escolha JPG, PNG ou WebP de até 2 MB.`);
                    continue;
                }
                try {
                    const source = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = () => reject(new Error('Falha na leitura'));
                        reader.onabort = () => reject(new Error('Leitura cancelada'));
                        reader.readAsDataURL(file);
                    });
                    if (!isImageSource(source, true)) throw new Error('Formato inválido');
                    const decodedImage = new Image();
                    decodedImage.src = source;
                    await decodedImage.decode();
                    images.push({ src: source, label: file.name.slice(0, 120) });
                    added++;
                } catch {
                    errors.push(`Não foi possível ler ${file.name}. Escolha uma imagem válida.`);
                }
            }
            if (added) {
                currentImage = images.length - 1;
                renderImages();
                markDirty();
            }
            setMessage(imageMessage, `${added ? `${added} foto(s) adicionada(s) ao rascunho. ` : ''}${errors.join(' ')}`.trim(), Boolean(errors.length));
        } finally {
            readingImages = false;
            imageInput.disabled = false;
            addImageButton.disabled = false;
            saveButton.disabled = false;
            imageInput.value = '';
        }
    });

    previewImage.addEventListener('error', () => {
        const source = previewImage.getAttribute('src');
        if (!source) return;
        failedImageSources.add(source);
        showImage();
    });
    function moveImage(direction) {
        if (!images.length) return;
        currentImage = (currentImage + direction + images.length) % images.length;
        showImage();
    }
    previousImage.addEventListener('click', () => moveImage(-1));
    nextImage.addEventListener('click', () => moveImage(1));
    byId('productCarousel').addEventListener('keydown', event => {
        if (images.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
            moveImage(event.key === 'ArrowLeft' ? -1 : 1);
        }
    });
    addSpecButton.addEventListener('click', () => addSpecification(undefined, true));
    form.addEventListener('input', event => {
        if (event.target === imageInput) return;
        markDirty();
        if (Object.values(fields).includes(event.target)) {
            updateContact();
            if (event.target === fields.name) showImage();
        }
    });
    fields.available.addEventListener('change', () => {
        updateContact();
        markDirty();
    });
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (readingImages || !form.reportValidity()) return;
        try {
            window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ...readProduct() }));
            dirty = false;
            setMessage(saveMessage, 'Rascunho salvo somente neste navegador. O anúncio não foi publicado nem enviado ao catálogo.');
        } catch {
            setMessage(saveMessage, 'Não foi possível salvar o rascunho neste navegador. O armazenamento pode estar bloqueado ou cheio. Reduza as fotos ou libere espaço e tente novamente; mantenha esta página aberta para não perder as alterações.', true);
        }
    });
    byId('cancelProductEdit').addEventListener('click', event => {
        if ((dirty || readingImages) && !window.confirm('Descartar as alterações não salvas e voltar ao painel? O último rascunho salvo neste navegador será mantido.')) {
            event.preventDefault();
            return;
        }
        dirty = false;
        readingImages = false;
    });
    window.addEventListener('beforeunload', event => {
        if (dirty || readingImages) {
            event.preventDefault();
            event.returnValue = '';
        }
    });

    try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
            const draft = JSON.parse(saved);
            if (!draft || draft.version !== 1) throw new Error('Rascunho inválido');
            fields.name.value = typeof draft.name === 'string' ? draft.name.slice(0, 120) : '';
            fields.description.value = typeof draft.description === 'string' ? draft.description.slice(0, 5000) : '';
            fields.price.value = typeof draft.price === 'string' && draft.price !== '' && Number.isFinite(Number(draft.price)) && Number(draft.price) >= 0 && Number(draft.price) <= 999999999.99 ? draft.price : '';
            fields.available.value = draft.available === false ? 'false' : 'true';
            fields.whatsapp.value = typeof draft.whatsapp === 'string' ? draft.whatsapp.slice(0, 25) : '';
            images = Array.isArray(draft.images) ? draft.images.filter(image => image && isImageSource(image.src, true)).slice(0, maxImages).map(image => ({
                src: image.src, label: typeof image.label === 'string' ? image.label.slice(0, 120) : 'Foto do equipamento'
            })) : [];
            if (Array.isArray(draft.specifications)) {
                draft.specifications.slice(0, 20).forEach(spec => {
                    if (spec && typeof spec.label === 'string' && typeof spec.value === 'string') {
                        addSpecification({ label: spec.label.slice(0, 80), value: spec.value.slice(0, 200) });
                    }
                });
            }
            setMessage(saveMessage, 'Rascunho recuperado deste navegador. O anúncio ainda não foi publicado.');
        }
    } catch {
        setMessage(saveMessage, 'Não foi possível recuperar o rascunho deste navegador. Os campos continuam disponíveis para edição.', true);
    }
    if (!specFields.children.length) addSpecification();
    renderImages();
    updateContact();
    saveButton.disabled = false;
})();
