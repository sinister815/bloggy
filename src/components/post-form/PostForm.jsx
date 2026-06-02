import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Select, RTE } from '../index'
import appwriteService from '../../appwrite/dbAuth'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function PostForm({ post }) {
  const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      content: post?.content || '',
      status: post?.status || 'active',
    },
  })

  const [preview, setPreview] = React.useState(null)
  const imageFile = watch('image')
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)

  const submit = async (data) => {
    if (post) {
      const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null

      if (file) {
        appwriteService.deleteFile(post.featuredImage)
      }

      const dbPost = await appwriteService.updatePost(post.$id, {
        ...data,
        featuredImage: file ? file.$id : undefined,
      })

      if (dbPost) {
        navigate(`/post/${dbPost.$id}`)
      }
    } else {
      const file = await appwriteService.uploadFile(data.image[0])

      if (file) {
        const fileId = file.$id
        data.featuredImage = fileId

        const dbPost = await appwriteService.createPost({
          ...data,
          userId: userData?.$id,
        })

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`)
        }
      }
    }
  }

  const slugTransform = useCallback((value) => {
    if (value && typeof value === 'string') {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, '-')
        .replace(/\s/g, '-')
    }

    return ''
  }, [])

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'title') {
        setValue('slug', slugTransform(value.title), { shouldValidate: true })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [watch, slugTransform, setValue])

  React.useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0]
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      return () => URL.revokeObjectURL(previewUrl)
    }

    setPreview(null)
  }, [imageFile])

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-6 lg:grid-cols-[1.4fr_0.75fr]">
      <div className="editorial-card rounded-3xl px-5 py-6 sm:px-7">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-slate-900">
            {post ? 'Edit your article' : 'Write a new article'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Shape the headline, SEO-friendly slug, and story content in one focused writing flow.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Title"
            {...register('title', { required: true })}
          />
          <Input
            label="Slug"
            placeholder="Slug"
            {...register('slug', { required: true })}
            onInput={(e) => {
              setValue('slug', slugTransform(e.currentTarget.value), { shouldValidate: true })
            }}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <RTE label="Content" name="content" control={control} defaultValue={getValues('content')} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="editorial-card rounded-3xl px-5 py-6 sm:px-7">
          <h3 className="text-2xl font-semibold text-slate-900">Publish Settings</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Upload a cover image, choose a status, and publish when your post is ready.
          </p>

          <div className="mt-6 space-y-5">
            <Input
              label="Featured Image"
              type="file"
              accept="image/png, image/jpg, image/jpeg, image/gif"
              {...register('image', { required: !post })}
            />

            {(preview || post) && (
              <div className="w-full">
                <img
                  src={preview || appwriteService.getFilePreview(post.featuredImage)}
                  alt={post?.title || 'Selected preview'}
                  className="h-auto w-full rounded-2xl border border-slate-200 object-cover"
                />
              </div>
            )}

            <Select options={['active', 'inactive']} label="Status" {...register('status', { required: true })} />

            <Button type="submit" bgColor={post ? 'bg-emerald-600' : 'bg-slate-950'} className="w-full">
              {post ? 'Update' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PostForm
