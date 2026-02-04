-- Políticas RLS para o bucket "files" (n.files).
-- Executar no Supabase Dashboard → SQL Editor se o bucket já existir e as políticas ainda não tiverem sido criadas.
-- Paths: {user_id}/{project_name}/... — primeiro segmento = auth.jwt() ->> 'sub'

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
