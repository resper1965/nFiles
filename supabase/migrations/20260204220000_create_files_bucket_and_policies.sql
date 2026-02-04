-- Bucket "files" para n.files (ness) — paths: {user_id}/{project_name}/...
-- RLS: usuário autenticado acessa apenas paths cujo primeiro segmento = auth.uid()

INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = EXCLUDED.public;

-- Políticas: primeiro segmento do path = auth.jwt() ->> 'sub' (user id)
CREATE POLICY "nfiles_select_own"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'files' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'));

CREATE POLICY "nfiles_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'files' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'));

CREATE POLICY "nfiles_update_own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'files' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'));

CREATE POLICY "nfiles_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'files' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'));
