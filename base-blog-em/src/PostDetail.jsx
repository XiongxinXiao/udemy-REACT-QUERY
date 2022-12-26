import { useMutation, useQuery } from "react-query";

async function fetchComments(postId) {
	const response = await fetch(
		`https://jsonplaceholder.typicode.com/comments?postId=${postId}`
	);
	return response.json();
}

async function deletePost(postId) {
	const response = await fetch(
		`https://jsonplaceholder.typicode.com/postId/${postId}`,
		{ method: "DELETE" }
	);
	return response.json();
}

async function updatePost(postId) {
	const response = await fetch(
		`https://jsonplaceholder.typicode.com/postId/${postId}`,
		{ method: "PATCH", data: { title: "REACT QUERY FOREVER!!!!" } }
	);
	return response.json();
}

export function PostDetail({ post }) {
	// replace with useQuery
	const { data, isLoading } = useQuery(["comments", post.id], () =>
		fetchComments(post.id)
	);

	const deleteMutation = useMutation((postId) => deletePost(postId));

	const updateMutation = useMutation((postId) => updatePost(postId));

	if (isLoading) return <h3>Loading...</h3>;

	return (
		<>
			<h3 style={{ color: "blue" }}>{post.title}</h3>
			<button onClick={() => deleteMutation.mutate(post.id)}>
				Delete
			</button>
			{deleteMutation.isSuccess && <h3>delete success</h3>}
			{updateMutation.isSuccess && <h3>update success</h3>}
			<button onClick={() => updateMutation.mutate(post.id)}>
				Update title
			</button>
			<p>{post.body}</p>
			<h4>Comments</h4>
			{data.map((comment) => (
				<li key={comment.id}>
					{comment.email}: {comment.body}
				</li>
			))}
		</>
	);
}
